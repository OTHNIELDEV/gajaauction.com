import React from 'react';
import { unescapeMarkdown } from '../../utils/markdownUtils';

/**
 * ExecutiveCoverLetter
 * ExitWise 정본 IM 최상단 커버레터 및 공식 서한 컴포넌트
 * - 문서번호, 비밀유지 등급, 수신/발신, 대표 인사말, 투자 자문 직인 렌더링
 */
export default function ExecutiveCoverLetter({ rawCoverLetter, docNumber, isDark, assetName }) {
    if (!rawCoverLetter && !assetName) return null;

    // 마크다운 파싱 및 메타데이터 추출
    const text = (rawCoverLetter || '').trim();
    const lines = text.split('\n');

    let parsedDocNo = docNumber || '';
    let parsedConfidential = 'STRICTLY CONFIDENTIAL · 기관투자자 및 적격투자자 전용';
    let parsedTo = '대표이사 및 투자심의위원회 귀하';
    let parsedFrom = '(주)가자에셋파트너스 투자자문본부 & ExitWise AI Intelligence';
    const bodyParagraphs = [];

    for (const l of lines) {
        const line = unescapeMarkdown(l.trim());
        if (!line) continue;
        if (/^문서번호[:\s]+(.*)$/i.test(line)) {
            parsedDocNo = unescapeMarkdown(line.replace(/^문서번호[:\s]+/i, '').trim());
        } else if (/confidential/i.test(line)) {
            parsedConfidential = unescapeMarkdown(line.replace(/^#+\s*/, '').trim());
        } else if (/^수신[:\s]+(.*)$/i.test(line)) {
            parsedTo = unescapeMarkdown(line.replace(/^수신[:\s]+/i, '').trim());
        } else if (/^발신[:\s]+(.*)$/i.test(line)) {
            parsedFrom = unescapeMarkdown(line.replace(/^발신[:\s]+/i, '').trim());
        } else if (line.startsWith('<<<') || line.startsWith('>>>')) {
            continue;
        } else {
            bodyParagraphs.push(line);
        }
    }

    const defaultForeword = `귀사의 무궁한 발전과 번영을 진심으로 기원합니다.

본 투자설명서(Information Memorandum)는 ${assetName || '매각 대상 자산'}의 성공적인 매각 및 투자 유치를 위해 ExitWise AI 기업가치 평가 엔진과 가자에셋 부동산 자산관리 전문 인력의 정밀 실사를 거쳐 작성된 공식 투자 자문 자료입니다.

본 자산은 탁월한 입지 경쟁력과 견고한 임대 수익률, 미래 가치 상승 잠재력을 동시에 갖춘 최우량 코어(Core) 포트폴리오로서, 귀사의 투자 전략에 최적의 시너지를 제공할 것으로 확신합니다.

상세한 재무 제원, 법적 권리관계 분석, 그리고 출구 전략 시뮬레이션 결과를 본 보고서에 충실히 수록하였사오니 심도 있는 검토를 요청드립니다.`;

    const finalBody = bodyParagraphs.length > 0 ? bodyParagraphs.join('\n\n') : defaultForeword;

    const bgCard = isDark 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)' 
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
    const borderColor = isDark ? 'rgba(217, 119, 6, 0.4)' : 'rgba(217, 119, 6, 0.3)';

    return (
        <div className="im-cover-card" style={{
            background: bgCard,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '36px 40px',
            margin: '24px 0 36px 0',
            boxShadow: isDark 
                ? '0 12px 35px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(251, 191, 36, 0.2)' 
                : '0 10px 30px rgba(0, 0, 0, 0.06), inset 0 1px 0 #ffffff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 상단 럭셔리 골드 라인 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #d97706 0%, #fbbf24 50%, #0284c7 100%)'
            }} />

            {/* 헤더 메타 (문서번호 / 비밀유지 등급) */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                paddingBottom: '20px',
                marginBottom: '26px'
            }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: isDark ? 'rgba(217, 119, 6, 0.15)' : '#fef3c7',
                        border: '1px solid rgba(217, 119, 6, 0.3)',
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        color: isDark ? '#fbbf24' : '#b45309',
                        letterSpacing: '0.04em',
                        marginBottom: '8px'
                    }}>
                        <span>🔒</span> {parsedConfidential}
                    </div>
                    <div style={{
                        fontSize: '0.82rem',
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontFamily: 'monospace'
                    }}>
                        문서 식별 번호: <strong style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{parsedDocNo || 'EW-2026-IM-OFFICIAL'}</strong>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: isDark ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                    color: isDark ? '#38bdf8' : '#0284c7',
                    fontSize: '0.8rem',
                    fontWeight: '800'
                }}>
                    <span>⚡</span> ExitWise IB 공식 서한
                </div>
            </div>

            {/* 수신 및 발신 박스 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
                padding: '16px 20px',
                borderRadius: '10px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #edf2f7',
                marginBottom: '26px'
            }}>
                <div>
                    <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600' }}>수신(To): </span>
                    <strong style={{ fontSize: '0.92rem', color: isDark ? '#f1f5f9' : '#0f172a' }}>{parsedTo}</strong>
                </div>
                <div>
                    <span style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600' }}>발신(From): </span>
                    <strong style={{ fontSize: '0.92rem', color: isDark ? '#f1f5f9' : '#0f172a' }}>{parsedFrom}</strong>
                </div>
            </div>

            {/* 대표 인사말 서문 본문 */}
            <div style={{
                fontSize: '0.98rem',
                lineHeight: '1.9',
                color: isDark ? '#cbd5e1' : '#334155',
                whiteSpace: 'pre-line',
                marginBottom: '30px'
            }}>
                {finalBody}
            </div>

            {/* 하단 공식 직인 및 서명 블록 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '16px',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                paddingTop: '20px'
            }}>
                <div style={{ fontSize: '0.8rem', color: isDark ? '#64748b' : '#94a3b8' }}>
                    * 본 문서는 ExitWise 결정론 검증 및 가자에셋 자산운용 실사를 정식 통과한 정본(Primary) IM입니다.
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    textAlign: 'right'
                }}>
                    <div>
                        <div style={{ fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>자산 매각 주관사</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: '900', color: isDark ? '#ffffff' : '#0f172a' }}>
                            (주)가자에셋파트너스
                        </div>
                    </div>
                    <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        border: '2px dashed #d97706',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '0.75rem',
                        transform: 'rotate(-12deg)',
                        boxShadow: '0 0 10px rgba(217, 119, 6, 0.2)'
                    }}>
                        심의필
                    </div>
                </div>
            </div>
        </div>
    );
}
