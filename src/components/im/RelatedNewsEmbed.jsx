import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { unescapeMarkdown } from '../../utils/markdownUtils';

export default function RelatedNewsEmbed({ raw, spec: propSpec, isDark: propIsDark, title: propTitle }) {
    const { isDark: themeIsDark } = useTheme();
    const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;

    // 1. JSON 안전 파싱 및 뉴스 목록 추출
    const newsList = useMemo(() => {
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
        } else if (Array.isArray(parsed.items)) {
            items = parsed.items;
        } else if (Array.isArray(parsed.news)) {
            items = parsed.news;
        } else if (Array.isArray(parsed.articles)) {
            items = parsed.articles;
        } else if (Array.isArray(parsed.data)) {
            items = parsed.data;
        } else if (parsed.title) {
            items = [parsed];
        }

        return items
            .filter(item => item && item.title)
            .map(item => {
                const rawTitle = item.title || '';
                const cleanTitle = unescapeMarkdown(rawTitle).replace(/^\*+|\*+$/g, '').trim();

                // 언론사 출처 추출 (source가 없으면 url의 도메인 파싱)
                let source = item.source || '';
                if (!source && item.url) {
                    try {
                        const urlObj = new URL(item.url);
                        source = urlObj.hostname.replace(/^www\./, '');
                    } catch {
                        // ignore
                    }
                }
                if (!source) source = '부동산 뉴스';

                // 날짜 포맷 정리
                let dateStr = item.date || item.publishedAt || item.time || '';
                if (dateStr) {
                    dateStr = dateStr.replace(/T.*$/, '').replace(/-/g, '.');
                }

                return {
                    title: cleanTitle,
                    source: unescapeMarkdown(source),
                    date: dateStr,
                    url: item.url || '',
                    summary: item.summary || item.snippet || item.description ? unescapeMarkdown(item.summary || item.snippet || item.description) : ''
                };
            });
    }, [raw, propSpec]);

    if (!newsList || newsList.length === 0) {
        return null;
    }

    const headerTitle = propTitle || '관련 뉴스 및 개발 동향';

    const cardBg = isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0';
    const subBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';
    const itemBg = isDark ? 'rgba(255, 255, 255, 0.025)' : '#f8fafc';
    const itemBorder = isDark ? 'rgba(255, 255, 255, 0.07)' : '#e2e8f0';

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
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}>
                        <i className="fas fa-newspaper"></i>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                color: '#10b981',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                ExitWise Market Intelligence
                            </span>
                            <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '12px',
                                background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                                color: '#059669',
                                fontWeight: '700'
                            }}>
                                총 {newsList.length}건
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
            </div>

            {/* News Items Grid */}
            <div style={{
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: newsList.length > 1 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
                gap: '16px'
            }}>
                {newsList.map((item, idx) => {
                    const hasUrl = Boolean(item.url);
                    const CardComponent = hasUrl ? 'a' : 'div';
                    const linkProps = hasUrl ? {
                        href: item.url,
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    } : {};

                    return (
                        <CardComponent
                            key={idx}
                            {...linkProps}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                background: itemBg,
                                border: `1px solid ${itemBorder}`,
                                borderRadius: '12px',
                                padding: '16px 18px',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.2s ease',
                                cursor: hasUrl ? 'pointer' : 'default',
                                position: 'relative'
                            }}
                            className="news-card-hover"
                        >
                            <div>
                                {/* Meta Badges */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '10px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: '700',
                                        color: '#0284c7',
                                        background: isDark ? 'rgba(14, 165, 233, 0.12)' : '#e0f2fe',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <i className="fas fa-globe" style={{ fontSize: '0.68rem' }}></i>
                                        {item.source}
                                    </span>
                                    {item.date && (
                                        <span style={{
                                            fontSize: '0.72rem',
                                            color: isDark ? '#94a3b8' : '#64748b',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <i className="far fa-calendar" style={{ fontSize: '0.68rem' }}></i>
                                            {item.date}
                                        </span>
                                    )}
                                </div>

                                {/* Article Title */}
                                <h5 style={{
                                    margin: '0 0 8px',
                                    fontSize: '0.98rem',
                                    fontWeight: '700',
                                    color: isDark ? '#f1f5f9' : '#0f172a',
                                    lineHeight: '1.5'
                                }}>
                                    {item.title}
                                </h5>

                                {/* Summary snippet if available */}
                                {item.summary && (
                                    <p style={{
                                        margin: '0 0 10px',
                                        fontSize: '0.84rem',
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        lineHeight: '1.6',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {item.summary}
                                    </p>
                                )}
                            </div>

                            {/* Outbound Link Footer */}
                            {hasUrl && (
                                <div style={{
                                    marginTop: '12px',
                                    paddingTop: '10px',
                                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '6px',
                                    fontSize: '0.76rem',
                                    fontWeight: '700',
                                    color: '#0ea5e9'
                                }}>
                                    <span>기사 원문 읽기</span>
                                    <i className="fas fa-arrow-up-right-from-square" style={{ fontSize: '0.7rem' }}></i>
                                </div>
                            )}
                        </CardComponent>
                    );
                })}
            </div>

            <style>{`
                .news-card-hover:hover {
                    transform: translateY(-2px);
                    border-color: #0ea5e9 !important;
                    box-shadow: 0 6px 18px rgba(14, 165, 233, 0.12);
                }
            `}</style>
        </div>
    );
}
