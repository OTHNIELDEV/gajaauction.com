import React from 'react';
import KakaoMapEmbed from './KakaoMapEmbed';
import SensitivitySimulator from './SensitivitySimulator';
import FinancialChart from './FinancialChart';
import KpiStatCards from './KpiStatCards';
import FloorStackPlan from './FloorStackPlan';
import ExecutiveCoverLetter from './ExecutiveCoverLetter';

function renderInlineMarkdown(text, isDark) {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={idx} style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: '700' }}>
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
}

function MarkdownTable({ lines, isDark }) {
    if (!lines || lines.length < 2) return null;

    const parseRow = (line) =>
        line
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim());

    const header = parseRow(lines[0]);
    const bodyRows = lines.slice(2).map(parseRow);
    const subCardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

    return (
        <div className="no-scrollbar" style={{ overflowX: 'auto', margin: '20px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderBottom: `2px solid ${subCardBorder}` }}>
                        {header.map((col, idx) => (
                            <th
                                key={idx}
                                style={{
                                    textAlign: idx === 0 ? 'left' : 'right',
                                    padding: '12px 14px',
                                    color: isDark ? '#94a3b8' : '#475569',
                                    fontWeight: '700',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bodyRows.map((row, rIdx) => (
                        <tr
                            key={rIdx}
                            style={{
                                borderBottom: `1px solid ${subCardBorder}`,
                                background: rIdx % 2 === 1 ? (isDark ? 'rgba(255,255,255,0.015)' : '#f8fafc') : 'transparent'
                            }}
                        >
                            {row.map((cell, cIdx) => (
                                <td
                                    key={cIdx}
                                    style={{
                                        textAlign: cIdx === 0 ? 'left' : 'right',
                                        padding: '12px 14px',
                                        color: cIdx === 0 ? (isDark ? '#ffffff' : '#0f172a') : (isDark ? '#cbd5e1' : '#334155'),
                                        fontWeight: cIdx === 0 || cell.includes('억') ? '600' : 'normal',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {renderInlineMarkdown(cell, isDark)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ExitWiseMarkdownViewer({ markdown, isDark, assetName, docNumber, listingId }) {
    if (!markdown || !markdown.trim()) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
                생성된 IM 본문 내용이 없습니다.
            </div>
        );
    }

    // 1. 서문(Cover Letter) 추출 (삭제하지 않고 온전히 보존하여 렌더링)
    const coverMatch = markdown.match(/<<<\s*COVER[_\s]*LETTER[_\s]*START\s*>>>([\s\S]*?)<<<\s*COVER[_\s]*LETTER[_\s]*END\s*>>>/i);
    const rawCoverLetter = coverMatch ? coverMatch[1].trim() : null;

    // 2. 마크다운 본문 정규화 (서문은 본문 카드에서 중복 방지를 위해 제외하되 메인 서한으로 독립 렌더링)
    let cleanMd = markdown
        .replace(/<!--\s*slide:.*?-->/gi, '')
        .replace(/<<<\s*COVER[_\s]*LETTER[_\s]*START\s*>>>[\s\S]*?<<<\s*COVER[_\s]*LETTER[_\s]*END\s*>>>/gi, '')
        .replace(/<<<\s*DOC[_\s]*TITLE[_\s]*START\s*>>>[\s\S]*?<<<\s*DOC[_\s]*TITLE[_\s]*END\s*>>>/gi, '')
        .replace(/<<<\s*IM[_\s]*BODY[_\s]*START\s*>>>/gi, '')
        .replace(/<<<\s*IM[_\s]*BODY[_\s]*END\s*>>>/gi, '')
        .replace(/<<<\s*EXPERT[_\s]*MATCH[_\s]*START\s*>>>[\s\S]*$/gi, '')
        .trim();

    const rawLines = cleanMd.split('\n');
    const sections = [];
    let currentSection = { title: '', level: 2, lines: [] };
    let inCodeBlock = false;

    // 3. 챕터 위계 관리: ## Chapter 또는 ## N. 등 메인 챕터만 최상위 카드로 분할
    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }

        // Only split top-level cards on ## (h2) or # (h1)
        const chapterMatch = !inCodeBlock && line.match(/^(#{1,2})\s+(.+)$/);

        if (chapterMatch && (chapterMatch[1] === '##' || chapterMatch[1] === '#')) {
            if (currentSection.lines.length > 0 || currentSection.title) {
                sections.push(currentSection);
            }
            currentSection = {
                title: chapterMatch[2].trim(),
                level: chapterMatch[1].length,
                lines: []
            };
        } else {
            currentSection.lines.push(line);
        }
    }
    if (currentSection.lines.length > 0 || currentSection.title) {
        sections.push(currentSection);
    }

    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const subCardBg = isDark ? 'rgba(255, 255, 255, 0.025)' : '#f8fafc';
    const subCardBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* 정본 Executive Cover Letter (서문 & 대표 인사말) */}
            <ExecutiveCoverLetter 
                rawCoverLetter={rawCoverLetter} 
                isDark={isDark} 
                assetName={assetName}
            />

            {sections.map((sec, secIdx) => {
                const title = sec.title;
                const isDocHeader = sec.level === 1; // # 문서 대제목
                const isRiskWarning = title.includes('위험 경고') || title.includes('Risk Warning');

                if (isDocHeader) {
                    return (
                        <div key={secIdx} className="im-doc-header-card" style={{
                            padding: '28px 32px',
                            background: isDark ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(14, 165, 233, 0.03) 100%)' : '#f0f9ff',
                            border: isDark ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid #bae6fd',
                            borderRadius: '16px',
                            marginBottom: '6px'
                        }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                ExitWise Primary Investment Memorandum
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: '900', color: isDark ? '#ffffff' : '#0f172a' }}>
                                {title.replace(/^[#\s]+/, '')}
                            </h2>
                        </div>
                    );
                }

                const renderedBlocks = [];
                let tableBuffer = [];
                let specBuffer = [];

                const flushTable = () => {
                    if (tableBuffer.length > 0) {
                        renderedBlocks.push(
                            <MarkdownTable key={`tbl-${renderedBlocks.length}`} lines={[...tableBuffer]} isDark={isDark} />
                        );
                        tableBuffer = [];
                    }
                };

                const flushSpecs = () => {
                    if (specBuffer.length > 0) {
                        renderedBlocks.push(
                            <div
                                key={`spec-${renderedBlocks.length}`}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '14px',
                                    background: subCardBg,
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: `1px solid ${subCardBorder}`,
                                    margin: '18px 0'
                                }}
                            >
                                {specBuffer.map((item, idx) => (
                                    <div key={idx}>
                                        <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.82rem', marginBottom: '4px' }}>
                                            {item.key}
                                        </div>
                                        <div style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: '700', fontSize: '1.05rem' }}>
                                            {renderInlineMarkdown(item.val, isDark)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                        specBuffer = [];
                    }
                };

                for (let i = 0; i < sec.lines.length; i++) {
                    const line = sec.lines[i];
                    const trimmedLine = line.trim();

                    // 소제목 (### 또는 ####) - 챕터 카드 내부의 우아한 서브 섹션으로 렌더링
                    if (trimmedLine.startsWith('### ') || trimmedLine.startsWith('#### ')) {
                        flushTable();
                        flushSpecs();
                        const subTitle = trimmedLine.replace(/^#+\s+/, '');
                        renderedBlocks.push(
                            <div
                                key={`sub-${renderedBlocks.length}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    margin: '28px 0 14px 0',
                                    paddingBottom: '8px',
                                    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #edf2f7'
                                }}
                            >
                                <span style={{ width: '4px', height: '16px', background: '#0ea5e9', borderRadius: '2px' }} />
                                <h4 style={{ margin: 0, fontSize: '1.12rem', fontWeight: '800', color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                    {subTitle}
                                </h4>
                            </div>
                        );
                        continue;
                    }

                    // 1. 커스텀 코드 블록 (kakao-map, sensitivity, recharts, chart, kpi, floorstack 등) 감지
                    if (trimmedLine.startsWith('```')) {
                        flushTable();
                        flushSpecs();

                        const lang = trimmedLine.slice(3).trim().toLowerCase();
                        const codeBuffer = [];
                        i++;
                        while (i < sec.lines.length && !sec.lines[i].trim().startsWith('```')) {
                            codeBuffer.push(sec.lines[i]);
                            i++;
                        }
                        const blockContent = codeBuffer.join('\n').trim();

                        if (lang === 'kakao-map' || lang === 'map') {
                            let mapProps = { address: '', title: '' };
                            try {
                                if (blockContent.startsWith('{')) {
                                    mapProps = JSON.parse(blockContent);
                                } else if (blockContent.includes(',')) {
                                    const parts = blockContent.split(',').map(s => s.trim());
                                    if (parts.length >= 2 && !isNaN(parseFloat(parts[0]))) {
                                        mapProps.lat = parseFloat(parts[0]);
                                        mapProps.lng = parseFloat(parts[1]);
                                        mapProps.title = parts[2] || '';
                                    } else {
                                        mapProps.address = blockContent;
                                    }
                                } else {
                                    mapProps.address = blockContent;
                                }
                            } catch (e) {
                                mapProps.address = blockContent;
                            }
                            renderedBlocks.push(
                                <KakaoMapEmbed
                                    key={`map-${renderedBlocks.length}`}
                                    listingId={mapProps.listingId || listingId}
                                    address={mapProps.address}
                                    title={mapProps.caption || mapProps.title || '자산 위치'}
                                    lat={mapProps.lat}
                                    lng={mapProps.lng}
                                    zoom={mapProps.zoom}
                                    caption={mapProps.caption}
                                />
                            );
                            continue;
                        } else if (lang === 'sensitivity') {
                            renderedBlocks.push(
                                <SensitivitySimulator
                                    key={`sens-${renderedBlocks.length}`}
                                    raw={blockContent}
                                />
                            );
                            continue;
                        } else if (lang === 'recharts' || lang === 'chart' || lang === 'graph') {
                            renderedBlocks.push(
                                <FinancialChart
                                    key={`chart-${renderedBlocks.length}`}
                                    raw={blockContent}
                                />
                            );
                            continue;
                        } else if (lang === 'kpi') {
                            renderedBlocks.push(
                                <KpiStatCards
                                    key={`kpi-${renderedBlocks.length}`}
                                    raw={blockContent}
                                />
                            );
                            continue;
                        } else if (lang === 'floorstack') {
                            renderedBlocks.push(
                                <FloorStackPlan
                                    key={`floor-${renderedBlocks.length}`}
                                    raw={blockContent}
                                />
                            );
                            continue;
                        } else {
                            // 일반 코드 블록 폴백
                            renderedBlocks.push(
                                <pre
                                    key={`code-${renderedBlocks.length}`}
                                    style={{
                                        background: isDark ? 'rgba(0,0,0,0.4)' : '#f1f5f9',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        overflowX: 'auto',
                                        fontSize: '0.85rem',
                                        color: isDark ? '#e2e8f0' : '#1e293b'
                                    }}
                                >
                                    <code>{blockContent}</code>
                                </pre>
                            );
                            continue;
                        }
                    }

                    // 2. 표 (Markdown Table) 파싱
                    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                        flushSpecs();
                        tableBuffer.push(trimmedLine);
                        continue;
                    } else {
                        flushTable();
                    }

                    // 3. 키-값 스펙 목록 (- 항목: 값)
                    const kvMatch = trimmedLine.match(/^[-*]\s*([^:：]+)[:：]\s*(.+)$/);
                    if (kvMatch && !trimmedLine.includes('http')) {
                        specBuffer.push({ key: kvMatch[1].trim(), val: kvMatch[2].trim() });
                        continue;
                    } else {
                        flushSpecs();
                    }

                    if (!trimmedLine || trimmedLine === '---') {
                        continue;
                    }

                    // 4. 감사 보고서 및 강조 박스 [확인], [주의]
                    const highlightMatch = trimmedLine.match(/^\[(.*?)\]\s*(.*)$/);
                    if (highlightMatch) {
                        const tag = highlightMatch[1];
                        const content = highlightMatch[2];
                        const isRed = tag.includes('주의') || tag.includes('경고');
                        const isGreen = tag.includes('확인') || tag.includes('통과');
                        const borderCol = isRed ? '#ef4444' : isGreen ? '#10b981' : '#0ea5e9';
                        const bgCol = isDark
                            ? (isRed ? 'rgba(239, 68, 68, 0.08)' : isGreen ? 'rgba(16, 185, 129, 0.08)' : 'rgba(14, 165, 233, 0.06)')
                            : (isRed ? '#fef2f2' : isGreen ? '#f0fdf4' : '#f0f9ff');

                        renderedBlocks.push(
                            <div
                                key={`hl-${renderedBlocks.length}`}
                                style={{
                                    background: bgCol,
                                    borderLeft: `4px solid ${borderCol}`,
                                    padding: '14px 18px',
                                    borderRadius: '0 8px 8px 0',
                                    margin: '14px 0',
                                    fontSize: '0.94rem',
                                    lineHeight: '1.7',
                                    color: isDark ? '#e2e8f0' : '#334155'
                                }}
                            >
                                <strong style={{ color: borderCol, marginRight: '8px' }}>[{tag}]</strong>
                                {renderInlineMarkdown(content, isDark)}
                            </div>
                        );
                        continue;
                    }

                    // 5. 번호 매기기 목록
                    const numMatch = trimmedLine.match(/^(\d+)[.)]\s*(.*)$/);
                    if (numMatch) {
                        renderedBlocks.push(
                            <div
                                key={`num-${renderedBlocks.length}`}
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    margin: '12px 0',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <span
                                    style={{
                                        minWidth: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: isDark ? 'rgba(14, 165, 233, 0.2)' : '#e0f2fe',
                                        color: '#0284c7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {numMatch[1]}
                                </span>
                                <div style={{ flex: 1, fontSize: '0.94rem', color: isDark ? '#cbd5e1' : '#334155', lineHeight: '1.7' }}>
                                    {renderInlineMarkdown(numMatch[2], isDark)}
                                </div>
                            </div>
                        );
                        continue;
                    }

                    // 6. 불릿 목록
                    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                        renderedBlocks.push(
                            <div
                                key={`bullet-${renderedBlocks.length}`}
                                style={{
                                    display: 'flex',
                                    gap: '10px',
                                    margin: '8px 0',
                                    alignItems: 'flex-start',
                                    fontSize: '0.94rem',
                                    color: isDark ? '#cbd5e1' : '#334155',
                                    lineHeight: '1.7'
                                }}
                            >
                                <span style={{ color: '#0ea5e9', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
                                <div style={{ flex: 1 }}>{renderInlineMarkdown(trimmedLine.replace(/^[-*]\s+/, ''), isDark)}</div>
                            </div>
                        );
                        continue;
                    }

                    // 7. 일반 문단
                    renderedBlocks.push(
                        <p
                            key={`p-${renderedBlocks.length}`}
                            style={{
                                margin: '12px 0',
                                fontSize: '0.95rem',
                                lineHeight: '1.75',
                                color: isDark ? '#cbd5e1' : '#334155'
                            }}
                        >
                            {renderInlineMarkdown(trimmedLine, isDark)}
                        </p>
                    );
                }

                flushTable();
                flushSpecs();

                if (isRiskWarning) {
                    return (
                        <div
                            key={secIdx}
                            className="im-chapter-card"
                            style={{
                                background: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fff5f5',
                                border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fecaca',
                                borderRadius: '12px',
                                padding: '24px 28px',
                                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: isDark ? '#f87171' : '#dc2626' }}>
                                <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.2rem' }}></i>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>{title.replace(/^[#\s]+/, '')}</h3>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: isDark ? '#fca5a5' : '#7f1d1d', lineHeight: '1.75' }}>
                                {renderedBlocks}
                            </div>
                        </div>
                    );
                }

                return (
                    <div
                        key={secIdx}
                        className="glass-card im-chapter-card"
                        style={{
                            padding: '35px',
                            borderRadius: '16px',
                            background: cardBg,
                            border: `1px solid ${cardBorder}`
                        }}
                    >
                        {title && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '22px',
                                    borderBottom: `1px solid ${subCardBorder}`,
                                    paddingBottom: '14px'
                                }}
                            >
                                <span
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                        color: 'white',
                                        fontWeight: '800',
                                        fontSize: '0.78rem',
                                        letterSpacing: '0.04em',
                                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                                    }}
                                >
                                    CHAPTER {secIdx < 9 ? `0${secIdx}` : secIdx}
                                </span>
                                <h3 style={{ margin: 0, fontSize: '1.35rem', color: isDark ? '#ffffff' : '#0f172a', fontWeight: '800' }}>
                                    {title.replace(/^[#\s]+/, '').replace(/^Chapter\s*\d+[.:\s]*/i, '')}
                                </h3>
                            </div>
                        )}
                        <div>{renderedBlocks}</div>
                    </div>
                );
            })}
        </div>
    );
}
