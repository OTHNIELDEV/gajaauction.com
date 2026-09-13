import React, { useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * SensitivitySimulator — ExitWise 인터랙티브 투자 민감도 분석기
 * 
 * - 매입가(±20%), 연간 NOI 성장률(0%~5%), Exit Cap Rate(2%~8%) 슬라이더 인터랙션
 * - 수치해석 이분법 기반 5개년 세전 IRR, 자본회수배수(MOIC), 진입 Cap Rate, 예상 매각가 실시간 연산
 */

const KRW_100M = 100000000;

function fmtEok(won) {
    if (!won || isNaN(won)) return '—';
    return `${(won / KRW_100M).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}억원`;
}

// 보유기간 현금흐름 IRR 이분법 계산
function computeIrr(cashflows) {
    const npv = (rate) =>
        cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
    let lo = -0.5;
    let hi = 1.5;
    if (npv(lo) * npv(hi) > 0) return null;
    for (let i = 0; i < 80; i++) {
        const mid = (lo + hi) / 2;
        if (npv(lo) * npv(mid) <= 0) hi = mid;
        else lo = mid;
    }
    return (lo + hi) / 2;
}

export default function SensitivitySimulator({ raw, basePrice: propBasePrice, annualNoi: propAnnualNoi, title: propTitle }) {
    const { isDark } = useTheme();

    const data = useMemo(() => {
        if (raw) {
            try {
                const parsed = typeof raw === 'string' ? JSON.parse(raw.trim()) : raw;
                return parsed;
            } catch (e) {
                console.warn('[SensitivitySimulator] Parse error:', e);
            }
        }
        return {
            title: propTitle || '투자 민감도 시뮬레이터 (Sensitivity Analysis)',
            basePrice: propBasePrice || 185000000000,
            annualNoi: propAnnualNoi || 10730000000,
            priceRangePct: 20,
            exitCapPct: 5.5,
            noiGrowthPct: 2.0,
            holdYears: 5
        };
    }, [raw, propBasePrice, propAnnualNoi, propTitle]);

    const [priceAdjPct, setPriceAdjPct] = useState(0);
    const [growthPct, setGrowthPct] = useState(data?.noiGrowthPct ?? 2.0);
    const [exitCapPct, setExitCapPct] = useState(data?.exitCapPct ?? 5.5);

    const result = useMemo(() => {
        if (!data) return null;
        const range = data.priceRangePct ?? 20;
        const price = data.basePrice * (1 + priceAdjPct / 100);
        const g = (growthPct ?? 2.0) / 100;
        const exitCap = (exitCapPct ?? 5.5) / 100;
        const years = Math.max(1, Math.min(10, data.holdYears ?? 5));

        const entryCap = data.annualNoi / price;
        const noiAt = (t) => data.annualNoi * Math.pow(1 + g, t);
        const exitValue = noiAt(years) / exitCap;

        const cashflows = [-price];
        for (let t = 1; t < years; t++) cashflows.push(noiAt(t));
        cashflows.push(noiAt(years) + exitValue);

        const irr = computeIrr(cashflows);
        const totalIn = cashflows.slice(1).reduce((a, b) => a + b, 0);
        const moic = totalIn / price;

        return { range, price, entryCap, exitValue, irr, moic, years };
    }, [data, priceAdjPct, growthPct, exitCapPct]);

    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    const cardBg = isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff';
    const subCardBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';
    const subCardBg = isDark ? 'rgba(255, 255, 255, 0.025)' : '#f8fafc';

    const sliderRow = (label, value, min, max, step, unit, onChange) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <span style={{ width: '110px', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: '700' }}>
                {label}
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{
                    flex: 1,
                    accentColor: '#0ea5e9',
                    cursor: 'pointer',
                    height: '6px',
                    borderRadius: '3px'
                }}
            />
            <span style={{
                width: '75px',
                textAlign: 'right',
                fontSize: '0.88rem',
                fontWeight: '800',
                color: isDark ? '#ffffff' : '#0f172a',
                fontFamily: 'monospace'
            }}>
                {value > 0 && label.includes('매입가') ? '+' : ''}{value}{unit}
            </span>
        </div>
    );

    const metrics = result ? [
        { label: '조정 매입가', value: fmtEok(result.price), highlight: false },
        { label: '진입 Cap Rate', value: `${(result.entryCap * 100).toFixed(2)}%`, highlight: true },
        { label: `${result.years}년 세전 IRR`, value: result.irr === null ? '—' : `${(result.irr * 100).toFixed(1)}%`, highlight: true },
        { label: 'MOIC (자본회수배수)', value: `${result.moic.toFixed(2)}×`, highlight: false },
        { label: '5년차 예상 매각가', value: fmtEok(result.exitValue), highlight: false },
    ] : [];

    return (
        <div style={{
            margin: '24px 0',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            overflow: 'hidden',
            background: cardBg,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 20px',
                borderBottom: `1px solid ${subCardBorder}`,
                background: isDark
                    ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.5) 100%)'
                    : 'linear-gradient(90deg, #f0f9ff 0%, #f8fafc 100%)'
            }}>
                <span style={{ fontSize: '1rem', color: '#0ea5e9' }}>⚙️</span>
                <span style={{ fontSize: '0.92rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                    {data.title || 'ExitWise 투자 민감도 시뮬레이터'}
                </span>
                <span style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginLeft: 'auto' }}>
                    슬라이더를 조정하여 실시간 수익률 산출
                </span>
            </div>

            {/* Slider Controls */}
            <div style={{ padding: '20px 24px' }}>
                {sliderRow('매입가 조정', priceAdjPct, -result?.range || -20, result?.range || 20, 1, '%', setPriceAdjPct)}
                {sliderRow('NOI 성장률', growthPct, 0, 5, 0.1, '%', setGrowthPct)}
                {sliderRow('Exit Cap Rate', exitCapPct, 2, 8, 0.1, '%', setExitCapPct)}

                {/* Metrics Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    marginTop: '20px'
                }}>
                    {metrics.map((m, idx) => (
                        <div key={idx} style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: `1px solid ${subCardBorder}`,
                            background: subCardBg,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>
                                {m.label}
                            </div>
                            <div style={{
                                fontSize: '1.05rem',
                                fontWeight: '800',
                                color: m.highlight ? '#0ea5e9' : (isDark ? '#ffffff' : '#0f172a'),
                                fontFamily: 'monospace'
                            }}>
                                {m.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Caption */}
            <div style={{
                padding: '10px 20px',
                fontSize: '0.72rem',
                color: isDark ? '#64748b' : '#94a3b8',
                borderTop: `1px solid ${subCardBorder}`,
                background: isDark ? 'rgba(255, 255, 255, 0.015)' : '#fafafa'
            }}>
                {data.caption || `기준: 매입가 ${fmtEok(data.basePrice)} · 연간 NOI ${fmtEok(data.annualNoi)}`} —
                ExitWise 결정론 재무 모델 기준 (연 1회 현금흐름·세전). 투자 참고용 보조 지표입니다.
            </div>
        </div>
    );
}
