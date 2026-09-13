import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { unescapeMarkdown } from '../../utils/markdownUtils';

export default function AudioBriefingPlayer({ raw, spec: propSpec, isDark: propIsDark }) {
    const { isDark: themeIsDark } = useTheme();
    const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;

    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1.0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showScript, setShowScript] = useState(false);
    const [copied, setCopied] = useState(false);

    const timerRef = useRef(null);
    const utteranceRef = useRef(null);

    // 1. JSON 스펙 안전 파싱
    const spec = useMemo(() => {
        if (propSpec) return propSpec;
        if (raw) {
            if (typeof raw === 'object') return raw;
            try {
                return JSON.parse(raw.trim());
            } catch {
                try {
                    // 줄바꿈이나 이스케이프가 섞인 경우 보정
                    return JSON.parse(raw.replace(/[\n\r\t]/g, ' '));
                } catch {
                    // ignore
                }
            }
        }
        return null;
    }, [raw, propSpec]);

    const title = spec?.title || '3분 음성 브리핑';
    const text = useMemo(() => {
        const rawText = spec?.text || spec?.script || spec?.content || spec?.summary || '';
        return unescapeMarkdown(rawText).trim();
    }, [spec]);

    // 예상 재생 시간 (초 단위: 한국어 분당 약 320자 기준)
    const estimatedDuration = useMemo(() => {
        if (spec?.duration) {
            const numMatch = String(spec.duration).match(/(\d+)/);
            if (numMatch) {
                const val = parseInt(numMatch[1], 10);
                if (String(spec.duration).includes('분')) return val * 60;
                return val;
            }
        }
        const len = text.length || 100;
        return Math.max(30, Math.round(len / 5.5));
    }, [spec, text]);

    // 음성 재생 정지 및 초기화
    const stopAudio = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(0);
    };

    // 음성 재생 토글 (Play / Pause / Resume)
    const togglePlay = () => {
        if (!('speechSynthesis' in window)) {
            alert('현재 브라우저 환경에서는 음성 합성(TTS) 기능이 지원되지 않습니다.');
            return;
        }

        if (isPlaying && !isPaused) {
            // 일시정지
            window.speechSynthesis.pause();
            setIsPaused(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        } else if (isPlaying && isPaused) {
            // 이어듣기
            window.speechSynthesis.resume();
            setIsPaused(false);
            startTimer();
        } else {
            // 새로 시작
            window.speechSynthesis.cancel();
            if (!text) return;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = rate;
            utterance.pitch = 1.0;

            // 한국어 음성 탐색
            const voices = window.speechSynthesis.getVoices();
            const koVoice = voices.find(v => v.lang.startsWith('ko') || v.lang.includes('KR'));
            if (koVoice) {
                utterance.voice = koVoice;
            }

            utterance.onstart = () => {
                setIsPlaying(true);
                setIsPaused(false);
                startTimer();
            };

            utterance.onend = () => {
                stopAudio();
            };

            utterance.onerror = (e) => {
                console.warn('[AudioBriefingPlayer] TTS error:', e);
                stopAudio();
            };

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        }
    };

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentTime(prev => {
                const next = prev + 1;
                if (next >= estimatedDuration) {
                    return estimatedDuration;
                }
                return next;
            });
        }, 1000 / rate);
    };

    // 재생 속도 변경
    const cycleRate = () => {
        const rates = [1.0, 1.25, 1.5];
        const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
        const nextRate = rates[nextIdx];
        setRate(nextRate);
        if (isPlaying) {
            stopAudio();
        }
    };

    // 컴포넌트 언마운트 시 음성 자동 정지
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // 대본 복사
    const handleCopyScript = () => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // 시간 포맷 (mm:ss)
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const progressPct = Math.min(100, (currentTime / estimatedDuration) * 100);

    const cardBg = isDark ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)';
    const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0';
    const subBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

    return (
        <div style={{
            margin: '22px 0',
            background: cardBg,
            border: cardBorder,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 22px',
                borderBottom: `1px solid ${subBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(241, 245, 249, 0.6)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
                    }}>
                        <i className={`fas ${isPlaying && !isPaused ? 'fa-volume-high' : 'fa-headphones'}`}></i>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                color: '#0ea5e9',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                ExitWise AI Voice Intelligence
                            </span>
                            <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '12px',
                                background: isDark ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe',
                                color: '#0284c7',
                                fontWeight: '700'
                            }}>
                                ⚡ 핵심 3분 요약
                            </span>
                        </div>
                        <h4 style={{
                            margin: '2px 0 0',
                            fontSize: '1.05rem',
                            fontWeight: '800',
                            color: isDark ? '#ffffff' : '#0f172a'
                        }}>
                            {title}
                        </h4>
                    </div>
                </div>

                {/* Speed & Script Toggle Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={cycleRate}
                        title="재생 속도 변경"
                        style={{
                            padding: '6px 11px',
                            borderRadius: '8px',
                            border: `1px solid ${subBorder}`,
                            background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                            color: isDark ? '#94a3b8' : '#475569',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <i className="fas fa-gauge-high" style={{ fontSize: '0.75rem' }}></i>
                        <span>{rate.toFixed(2).replace(/\.00$/, '')}x</span>
                    </button>

                    <button
                        onClick={() => setShowScript(prev => !prev)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${subBorder}`,
                            background: showScript ? (isDark ? 'rgba(14, 165, 233, 0.2)' : '#e0f2fe') : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'),
                            color: showScript ? '#0284c7' : (isDark ? '#94a3b8' : '#475569'),
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <i className={`fas ${showScript ? 'fa-book-open' : 'fa-align-left'}`} style={{ fontSize: '0.75rem' }}></i>
                        <span>대본 {showScript ? '닫기' : '보기'}</span>
                    </button>
                </div>
            </div>

            {/* Main Player Controls */}
            <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
                    {/* Big Play / Pause Button */}
                    <button
                        onClick={togglePlay}
                        style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            border: 'none',
                            background: isPlaying && !isPaused
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                            color: '#ffffff',
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: isPlaying && !isPaused
                                ? '0 6px 18px rgba(245, 158, 11, 0.4)'
                                : '0 6px 18px rgba(14, 165, 233, 0.4)',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                        }}
                    >
                        <i className={`fas ${isPlaying && !isPaused ? 'fa-pause' : 'fa-play'}`} style={{ marginLeft: isPlaying && !isPaused ? '0' : '3px' }}></i>
                    </button>

                    {/* Stop Button (only active if playing or paused) */}
                    {isPlaying && (
                        <button
                            onClick={stopAudio}
                            title="처음으로 / 정지"
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                border: `1px solid ${subBorder}`,
                                background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                                color: isDark ? '#cbd5e1' : '#64748b',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            <i className="fas fa-stop"></i>
                        </button>
                    )}

                    {/* Animated Equalizer Waveform Bars */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        height: '32px',
                        padding: '0 8px'
                    }}>
                        {[24, 14, 28, 18, 30, 16, 22, 12].map((baseHeight, idx) => {
                            const isBarActive = isPlaying && !isPaused;
                            return (
                                <span
                                    key={idx}
                                    style={{
                                        display: 'inline-block',
                                        width: '4px',
                                        height: isBarActive ? `${baseHeight}px` : '6px',
                                        borderRadius: '2px',
                                        background: isBarActive
                                            ? idx % 2 === 0 ? '#0ea5e9' : '#f59e0b'
                                            : (isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'),
                                        transition: 'height 0.25s ease',
                                        animation: isBarActive ? `pulseBar ${0.5 + (idx % 4) * 0.15}s infinite alternate ease-in-out` : 'none'
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Play Status & Timer Text */}
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            color: isPlaying ? (isPaused ? '#f59e0b' : '#0ea5e9') : (isDark ? '#94a3b8' : '#64748b')
                        }}>
                            {isPlaying ? (isPaused ? '일시 정지됨' : 'AI 음성 브리핑 재생 중...') : '클릭하여 음성 듣기'}
                        </div>
                        <div style={{
                            fontSize: '0.78rem',
                            color: isDark ? '#64748b' : '#94a3b8',
                            fontVariantNumeric: 'tabular-nums',
                            marginTop: '2px'
                        }}>
                            {formatTime(currentTime)} / {formatTime(estimatedDuration)}
                        </div>
                    </div>
                </div>

                {/* Progress Track */}
                <div style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            {/* Expandable Script Panel */}
            {showScript && (
                <div style={{
                    padding: '20px 24px',
                    borderTop: `1px solid ${subBorder}`,
                    background: isDark ? 'rgba(0, 0, 0, 0.25)' : '#f8fafc',
                    animation: 'fadeIn 0.2s ease-in'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            fontSize: '0.82rem',
                            fontWeight: '800',
                            color: isDark ? '#cbd5e1' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <i className="fas fa-file-lines" style={{ color: '#0ea5e9' }}></i>
                            <span>AI 음성 브리핑 전문 스크립트</span>
                        </div>
                        <button
                            onClick={handleCopyScript}
                            style={{
                                padding: '4px 9px',
                                borderRadius: '6px',
                                border: `1px solid ${subBorder}`,
                                background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                color: copied ? '#10b981' : (isDark ? '#94a3b8' : '#64748b'),
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                            <span>{copied ? '복사됨!' : '대본 복사'}</span>
                        </button>
                    </div>

                    <div style={{
                        fontSize: '0.92rem',
                        lineHeight: '1.8',
                        color: isDark ? '#e2e8f0' : '#334155',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        paddingRight: '6px',
                        whiteSpace: 'pre-line'
                    }}>
                        {text || '브리핑 대본이 제공되지 않았습니다.'}
                    </div>
                </div>
            )}

            {/* Injected CSS keyframes for waveform animation */}
            <style>{`
                @keyframes pulseBar {
                    0% { transform: scaleY(0.4); opacity: 0.7; }
                    100% { transform: scaleY(1.2); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
