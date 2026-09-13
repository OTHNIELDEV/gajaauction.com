import React, { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { unescapeMarkdown } from '../../utils/markdownUtils';

export default function RelatedVideosEmbed({ raw, spec: propSpec, isDark: propIsDark, title: propTitle }) {
    const { isDark: themeIsDark } = useTheme();
    const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;

    const [activeIndex, setActiveIndex] = useState(0);

    // 1. JSON 안전 파싱 및 비디오 목록 추출
    const videoList = useMemo(() => {
        let parsed = propSpec;
        if (!parsed && raw) {
            if (typeof raw === 'object') {
                parsed = raw;
            } else {
                try {
                    parsed = JSON.parse(raw.trim());
                } catch {
                    try {
                        parsed = JSON.parse(raw.replace(/[\n\r\t]/g, ' '));
                    } catch {
                        // ignore
                    }
                }
            }
        }

        if (!parsed) return [];

        let items = [];
        if (Array.isArray(parsed)) {
            items = parsed;
        } else if (Array.isArray(parsed.videos)) {
            items = parsed.videos;
        } else if (Array.isArray(parsed.videoList)) {
            items = parsed.videoList;
        } else if (Array.isArray(parsed.items)) {
            items = parsed.items;
        } else if (parsed.videoId) {
            items = [parsed];
        }

        return items
            .filter(item => item && (item.videoId || item.url))
            .map(item => {
                let id = item.videoId;
                if (!id && item.url) {
                    const match = item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                    if (match) id = match[1];
                }
                const rawTitle = item.title || '현장 및 매물 분석 영상';
                const cleanTitle = unescapeMarkdown(rawTitle).replace(/^\*+|\*+$/g, '').trim();

                return {
                    videoId: id,
                    title: cleanTitle,
                    description: item.description ? unescapeMarkdown(item.description) : '',
                    source: item.source || item.channel || 'YouTube'
                };
            })
            .filter(item => Boolean(item.videoId));
    }, [raw, propSpec]);

    if (!videoList || videoList.length === 0) {
        return null;
    }

    const activeVideo = videoList[activeIndex] || videoList[0];
    const headerTitle = propTitle || '관련 영상 분석';

    const cardBg = isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0';
    const subBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';

    return (
        <div style={{
            margin: '22px 0',
            background: cardBg,
            border: cardBorder,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.05)',
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
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(248, 250, 252, 0.8)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: '#ff0000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)'
                    }}>
                        <i className="fab fa-youtube"></i>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                color: '#ef4444',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                ExitWise Video Intelligence
                            </span>
                            <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '12px',
                                background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                                color: '#dc2626',
                                fontWeight: '700'
                            }}>
                                총 {videoList.length}편
                            </span>
                        </div>
                        <h4 style={{
                            margin: '2px 0 0',
                            fontSize: '1.05rem',
                            fontWeight: '800',
                            color: isDark ? '#ffffff' : '#0f172a'
                        }}>
                            {headerTitle}
                        </h4>
                    </div>
                </div>

                <a
                    href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${subBorder}`,
                        background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                        color: isDark ? '#cbd5e1' : '#475569',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>YouTube 원본 보기</span>
                    <i className="fas fa-arrow-up-right-from-square" style={{ fontSize: '0.7rem', color: '#ef4444' }}></i>
                </a>
            </div>

            {/* Embedded Responsive Player */}
            <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 Aspect Ratio
                background: '#000000'
            }}>
                <iframe
                    key={activeVideo.videoId}
                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1`}
                    title={activeVideo.title}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>

            {/* Video Caption & Title Bar */}
            <div style={{
                padding: '16px 20px',
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                borderTop: `1px solid ${subBorder}`
            }}>
                <div style={{
                    fontSize: '0.98rem',
                    fontWeight: '700',
                    color: isDark ? '#ffffff' : '#0f172a',
                    lineHeight: '1.5'
                }}>
                    {activeVideo.title}
                </div>
            </div>

            {/* Multiple Video Selection Thumbnails (when > 1 video) */}
            {videoList.length > 1 && (
                <div style={{
                    padding: '14px 20px 20px',
                    borderTop: `1px solid ${subBorder}`,
                    background: isDark ? 'rgba(0, 0, 0, 0.2)' : '#f8fafc'
                }}>
                    <div style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: isDark ? '#94a3b8' : '#64748b',
                        marginBottom: '10px'
                    }}>
                        영상 목록 선택 ({activeIndex + 1}/{videoList.length})
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '12px'
                    }}>
                        {videoList.map((vid, idx) => {
                            const isActive = idx === activeIndex;
                            return (
                                <div
                                    key={vid.videoId || idx}
                                    onClick={() => setActiveIndex(idx)}
                                    style={{
                                        cursor: 'pointer',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: isActive ? '2px solid #ef4444' : `1px solid ${subBorder}`,
                                        background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isActive ? '0 4px 14px rgba(239, 68, 68, 0.25)' : 'none'
                                    }}
                                >
                                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                                        <img
                                            src={`https://img.youtube.com/vi/${vid.videoId}/mqdefault.jpg`}
                                            alt={vid.title}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        {isActive && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '6px',
                                                left: '6px',
                                                background: '#ef4444',
                                                color: '#ffffff',
                                                fontSize: '0.65rem',
                                                fontWeight: '800',
                                                padding: '2px 6px',
                                                borderRadius: '4px'
                                            }}>
                                                재생 중
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        padding: '8px 10px',
                                        fontSize: '0.82rem',
                                        fontWeight: isActive ? '700' : '500',
                                        color: isActive ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#94a3b8' : '#64748b'),
                                        lineHeight: '1.4',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {vid.title}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
