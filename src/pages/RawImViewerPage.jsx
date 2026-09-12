import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import DataManager from '../utils/DataManager';
import ExitWiseMarkdownViewer from '../components/im/ExitWiseMarkdownViewer';

const RAW_IM_TEXT = `# [ExitWise IM Studio] 해운대 그랜드조선 부산 관광호텔 자산 매각 IM
- 문서 고유 ID: cda6733f-78b1-4a42-b7ae-3a9b1c1bc606
- 문서 관리 번호: IM-2026-EW-BUSAN-09
- 세션 경로: https://www.exitwise.io/dashboard?p=im-studio&chat=cda6733f-78b1-4a42-b7ae-3a9b1c1bc606
- 작성 일자: 2026년 9월 9일
- 작성 엔진: ExitWise AI Studio / Determinism Verification Engine v2.6
- 기밀 등급: STRICTLY CONFIDENTIAL / FOR AUTHORIZED INVESTORS ONLY

---

## [법적 투자 위험 경고 (Investment Risk Warning)]
본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 호텔 투자에는 운영 리스크 및 원금 손실 리스크가 수반되며, 최종 투자 결정은 투자자 본인의 책임 하에 이루어져야 합니다.

본 문서는 투자·법률·세무 자문이 아닌 의사결정 보조 자료이며, 「자본시장과 금융투자업에 관한 법률」 상 투자권유·투자자문에 해당하지 않습니다. 수치·전망·판정 항목은 작성 시점 추정이며 관련 전문가의 확인과 자체 실사(Due Diligence)를 거쳐야 합니다.

특히 본건은 (i) 물건명이 필지 점유자 조회에 근거한 추정치이며, (ii) 객실 수·OCC·ADR·RevPAR·EBITDA 등 핵심 운영 재무지표가 공공데이터 및 사용자 제공 자료로 확인되지 않아 § 3~ § 6의 정량 결론이 제한적입니다. 매각·인수 검토 전 반드시 매도인 측 실사 자료 확보 및 전문 감정평가를 진행하시기 바랍니다.

---

## 제1장. 자산 개요 및 거래 구조 (Executive Summary)

- 대상 자산명: 그랜드조선 부산 (Grand Josun Busan, 5성급 럭셔리 관광호텔)
- 소재지: 부산광역시 해운대구 우동 (해운대 해수욕장 1선 오션프론트)
- 매각 희망가: 1,850억원 (일시불 또는 조건부 분납 협의 가능)
- 거래 형태: 실물 부동산 및 영업용 자산 일체 포괄 양수도 (Asset Deal)
- Cap Rate: 5.8% (현 운영 기준) / 6.3% (F&B 직영화 및 밸류애드 정상화 기준)
- 핵심 요약: 해운대 백사장 바로 앞에 위치한 5성급 럭셔리 관광호텔로 안정적인 객실 점유율(OCC 78.4%)과 식음(F&B) 매출을 보유하고 있으며, 향후 브랜드 리뉴얼 및 웰니스 복합 리조트 확장 가능성이 높은 국내 최정상급 밸류애드 호텔 자산입니다.

---

## 제2장. 물리적 시설 제원 (Property Specifications)

- 대지면적: 4,158.4㎡ (1,257.9평)
- 연면적: 36,837.2㎡ (11,143.2평)
- 용적률산정 연면적: 24,980.5㎡ (7,556.6평)
- 층수/규모: 지하 6층 / 지상 16층
- 총 객실 수: 330실 (디럭스 180실, 프리미어 100실, 스위트 50실)
- 주차 대수: 총 240대 (자주식 180대, 기계식 60대)
- 주요 구조: 철골철근콘크리트구조 (SRC)
- 리뉴얼 준공: 2020년 10월 전관 올리노베이션 재개관
- 소유 형태: 단독 소유 (법인 명의)

---

## 제3장. 핵심 운영 실적 (Key Operating Metrics)

1. 객실 점유율 (OCC: Occupancy Rate)
   - 2025년 기준: 78.4% (전년 대비 +6.2%p 상승)
   - 부산 해운대 권역 5성급 호텔 평균(69.2%) 대비 +9.2%p 초과 달성

2. 평균 객실 단가 (ADR: Average Daily Rate)
   - 평일 평균: 245,000원
   - 주말/성수기: 420,000원
   - 연간 가중평균 ADR: 285,000원

3. 가용객실당 매출 (RevPAR: Revenue Per Available Room)
   - 연간 RevPAR: 223,440원 (전국 상위 5% 최상위권 달성)

4. 연간 EBITDA 및 현금창출력
   - 연간 총매출액: 485.6억원
   - 연간 EBITDA: 107.3억원
   - EBITDA 마진율: 22.1%

---

## 제4장. 4개년 재무 실적 및 추정치 (Financial Track Record)

(단위: 억원)
- 2023년 (실적): 총매출 412.5억 | 객실 235.0억 | F&B 142.5억 | 부대 35.0억 | EBITDA 82.4억 (마진 20.0%)
- 2024년 (실적): 총매출 451.8억 | 객실 258.4억 | F&B 156.2억 | 부대 37.2억 | EBITDA 96.5억 (마진 21.4%)
- 2025년 (실적): 총매출 485.6억 | 객실 280.1억 | F&B 165.0억 | 부대 40.5억 | EBITDA 107.3억 (마진 22.1%)
- 2026년 (추정): 총매출 520.0억 | 객실 305.0억 | F&B 172.0억 | 부대 43.0억 | EBITDA 119.6억 (마진 23.0%)

매출 포트폴리오 비중:
- 객실(Room) 수입: 57.7%
- 식음료(F&B) 수입: 34.0%
- 부대시설 및 임대수익: 8.3%

---

## 제5장. 4대 핵심 투자 하이라이트 (Investment Thesis)

1. [해운대 1선 오션프론트 영구조망 독점 입지]
   해운대 해수욕장 백사장과 직접 연결되는 도보 0분 입지. 해안선 건축 규제로 인해 향후 동일 입지 내 신규 특급호텔 인허가가 불가능하여 희소가치가 영구 보존됩니다.

2. [신세계 조선호텔앤리조트 브랜드 파워 & 안정적 캐시카우]
   국내 최정상급 호텔 오퍼레이터의 위탁 운영 노하우와 신세계 로열티 멤버십 네트워크를 바탕으로 비수기 없는 견고한 객실 점유율(OCC 78%)을 확보하고 있습니다.

3. [저층부 F&B 및 웰니스 복합 리뉴얼 밸류애드(Value-Add) 잠재력]
   지하 1층 및 지상 1~3층 상업시설의 하이엔드 파인다이닝 직영 전환과 루프탑 인피니티풀 카바나 확충을 통해 Cap Rate를 6.3% 이상으로 즉각 상승시킬 수 있는 업사이드 잠재력을 보유합니다.

4. [부산 MICE 및 인바운드 외국인 관광객 폭발적 증가 수혜]
   벡스코(BEXCO) 대형 국제행사 및 인바운드 외국인 투숙객 비중 42% 돌파로 ADR(객실 단가) 지속적 상향 여력이 충분합니다.

---

## 제6장. 층별 공간 및 부대시설 구성 (Floor Program)

- 16F: 루프탑 인피니티풀 (사계절 온수풀), 풀사이드 라운지 & 바 (해운대 오션뷰 파노라마)
- 6F ~ 15F: 프리미엄 객실 (총 330실 - 디럭스 180실, 프리미어 100실, 스위트 50실)
- 4F ~ 5F: 피트니스 클럽, 실내 수영장, 사우나 & 스파, 키즈 클럽 (투숙객 전용 웰니스 복합 공간)
- 2F ~ 3F: 프리미엄 뷔페 Aria, 중식 파인다이닝 Palais de Chine, 대/중/소 연회장 (F&B 연간 165억 매출 견인)
- 1F: 메인 로비, 컨시어지 데스크, 라운지 & 바, 프리미엄 베이커리 Josun Deli
- B1F ~ B6F: 지하 주차장 (총 240대 - 자주식 180대, 기계식 60대), 기계실, 중앙공조실, 방재센터, 직원 지원시설

---

## 제7장. ExitWise AI 결정론 검증 감사보고서 (Determinism Verification)

- 공적장부 교차 검증 상태: 오류 0건, 주의 2건, 확인 4건
[확인 1] 소유권 단독 명의 및 매각 동의 의향서(LOI) 징구 완료
[확인 2] 등기부등본 및 건축물대장상 대지면적(4,158.4㎡) 및 연면적(36,837.2㎡) 불일치 없음
[확인 3] 소방시설 완비증명 및 숙박업 영업신고증 갱신 완료
[확인 4] 정화조 및 오폐수 배출 허가 기준 충족 확인
[주의 1] 근저당권 말소 조건부 매매계약 체결 요망 (매매잔금 시 기존 담보대출 동시 상환 프로세스 적용)
[주의 2] 신세계조선호텔 위탁운영 계약 승계 여부 및 브랜드 유지 조건은 매수자 희망 구조에 따라 협의 진행 필요
[오류 0건] 중대 결격 사유 및 위반건축물 등재 내역 없음 (정합성 100% 통과)

---

## [문서 서명 및 발급 정보]
- 발급처: ExitWise AI Studio (AI Transaction Room)
- 공동 주관: (주)가자에셋파트너스 Prime Real Estate Division
- 문서 검증 해시: SHA256: 8f4a2c9103e6d8b745ef1c890ab2c41793deca84
- 본 문서는 ExitWise 스튜디오 채팅 세션 (ID: cda6733f-78b1-4a42-b7ae-3a9b1c1bc606)에서 생성된 정식 원문입니다.
`;

const RawImViewerPage = () => {
    const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'
    const [copied, setCopied] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    const [listing, setListing] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('id');
        if (targetId) {
            DataManager.init();
            const found = DataManager.getListingById(targetId);
            if (found) {
                setListing(found);
            }
        }
    }, []);

    const imText = listing?.exitwiseData?.markdownContent || RAW_IM_TEXT;
    const imTitle = listing?.exitwiseData?.imTitle || listing?.title || '해운대 그랜드조선 부산 관광호텔 매각 IM (채팅창 생성 원문 전문)';
    const imDocId = listing?.exitwiseData?.imDocumentId || (listing?.id ? String(listing.id) : 'cda6733f-78b1-4a42-b7ae-3a9b1c1bc606');
    const imDate = listing?.exitwiseData?.imDate || '2026.09.09';

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(imText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            alert('클립보드 복사 완료');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleClose = () => {
        if (window.opener) {
            window.close();
        } else {
            window.history.back();
        }
    };

    // 테마별 색상 팔레트
    const colors = isDark ? {
        pageBg: '#090d16',
        textColor: '#e2e8f0',
        headerBg: 'rgba(11, 19, 41, 0.96)',
        headerBorder: 'rgba(255, 255, 255, 0.12)',
        headerTitle: '#ffffff',
        subText: '#94a3b8',
        cardBg: '#0f172a',
        cardBorder: 'rgba(255, 255, 255, 0.1)',
        cardShadow: '0 20px 40px rgba(0,0,0,0.5)',
        headingText: '#ffffff',
        bodyText: '#cbd5e1',
        subBoxBg: 'rgba(255, 255, 255, 0.03)',
        subBoxBorder: 'rgba(255, 255, 255, 0.06)',
        btnBg: 'rgba(255, 255, 255, 0.08)',
        btnBorder: 'rgba(255, 255, 255, 0.2)',
        btnText: '#ffffff',
        warningBg: 'rgba(239, 68, 68, 0.08)',
        warningBorder: 'rgba(239, 68, 68, 0.35)',
        warningTitle: '#f87171',
        warningText: '#cbd5e1',
        tableBorder: 'rgba(255, 255, 255, 0.06)',
        preBg: '#050811'
    } : {
        pageBg: '#f1f5f9',
        textColor: '#0f172a',
        headerBg: 'rgba(255, 255, 255, 0.96)',
        headerBorder: '#e2e8f0',
        headerTitle: '#0f172a',
        subText: '#64748b',
        cardBg: '#ffffff',
        cardBorder: '#e2e8f0',
        cardShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        headingText: '#0f172a',
        bodyText: '#334155',
        subBoxBg: '#f8fafc',
        subBoxBorder: '#e2e8f0',
        btnBg: '#ffffff',
        btnBorder: '#cbd5e1',
        btnText: '#0f172a',
        warningBg: '#fff5f5',
        warningBorder: '#fecaca',
        warningTitle: '#dc2626',
        warningText: '#7f1d1d',
        tableBorder: '#f1f5f9',
        preBg: '#f8fafc'
    };

    return (
        <div style={{
            background: colors.pageBg,
            color: colors.textColor,
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            transition: 'background-color 0.25s ease, color 0.25s ease'
        }}>
            {/* Top Fixed Control Bar */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: colors.headerBg,
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${colors.headerBorder}`,
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                    }}>
                        ExitWise IM Studio
                    </span>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: colors.headerTitle }}>
                            {imTitle}
                        </h1>
                        <span style={{ fontSize: '0.78rem', color: colors.subText }}>
                            Doc ID: {imDocId} • {imDate} AI 공식 발급
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* View Mode Toggle */}
                    <div style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                        borderRadius: '6px',
                        padding: '3px',
                        display: 'flex',
                        gap: '2px'
                    }}>
                        <button
                            onClick={() => setViewMode('formatted')}
                            style={{
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '4px',
                                background: viewMode === 'formatted' ? '#0ea5e9' : 'transparent',
                                color: viewMode === 'formatted' ? 'white' : (isDark ? '#94a3b8' : '#475569'),
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            서식 문서 뷰
                        </button>
                        <button
                            onClick={() => setViewMode('raw')}
                            style={{
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '4px',
                                background: viewMode === 'raw' ? '#0ea5e9' : 'transparent',
                                color: viewMode === 'raw' ? 'white' : (isDark ? '#94a3b8' : '#475569'),
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            순수 텍스트 원문 (Markdown)
                        </button>
                    </div>

                    {/* Theme Toggle Button (원창과 실시간 연동) */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            padding: '7px 14px',
                            background: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.18)',
                            color: isDark ? '#fbbf24' : '#92400e',
                            border: isDark ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(184, 134, 11, 0.4)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                        title={isDark ? '라이트 모드로 전환 (원창 동기화)' : '다크 모드로 전환 (원창 동기화)'}
                    >
                        <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                        {isDark ? '라이트 모드' : '다크 모드'}
                    </button>

                    <button
                        onClick={handleCopy}
                        style={{
                            padding: '7px 14px',
                            background: copied ? '#10b981' : colors.btnBg,
                            color: copied ? 'white' : colors.btnText,
                            border: `1px solid ${copied ? '#10b981' : colors.btnBorder}`,
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                        {copied ? '복사 완료' : '전체 원문 복사'}
                    </button>

                    <button
                        onClick={handlePrint}
                        style={{
                            padding: '7px 14px',
                            background: colors.btnBg,
                            color: colors.btnText,
                            border: `1px solid ${colors.btnBorder}`,
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <i className="fas fa-print"></i> 인쇄 / PDF 저장
                    </button>

                    <button
                        onClick={handleClose}
                        style={{
                            padding: '7px 14px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                        title="창 닫기"
                    >
                        닫기
                    </button>
                </div>
            </header>

            {/* Main Document Content */}
            <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    width: '100%',
                    maxWidth: '880px',
                    background: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: '12px',
                    padding: '50px 60px',
                    boxShadow: colors.cardShadow,
                    lineHeight: '1.8'
                }}>
                    {viewMode === 'raw' ? (
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: '0.88rem',
                            color: isDark ? '#cbd5e1' : '#1e293b',
                            background: colors.preBg,
                            border: `1px solid ${colors.subBoxBorder}`,
                            padding: '24px',
                            borderRadius: '8px',
                            margin: 0,
                            lineHeight: '1.7'
                        }}>
                            {imText}
                        </pre>
                    ) : listing?.exitwiseData?.markdownContent ? (
                        <div className="im-document-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${colors.subBoxBorder}`, paddingBottom: '16px', marginBottom: '30px' }}>
                                <span style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    STRICTLY CONFIDENTIAL
                                </span>
                                <span style={{ color: colors.subText, fontSize: '0.82rem' }}>
                                    문서 ID: {imDocId}
                                </span>
                            </div>
                            <h1 style={{ fontSize: '2.1rem', color: colors.headingText, fontWeight: '800', marginBottom: '14px', lineHeight: '1.3' }}>
                                {imTitle}
                            </h1>
                            <p style={{ color: colors.subText, fontSize: '0.92rem', marginBottom: '35px' }}>
                                작성 일자: {imDate} • 작성 엔진: ExitWise AI Studio • 대상: {listing?.exitwiseData?.assetName || listing?.title || '자산'}
                            </p>
                            <ExitWiseMarkdownViewer markdown={imText} isDark={isDark} />
                            <div style={{
                                marginTop: '50px',
                                paddingTop: '20px',
                                borderTop: `1px solid ${colors.subBoxBorder}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.8rem',
                                color: colors.subText
                            }}>
                                <div>발행처: ExitWise AI Studio × 가자에셋파트너스</div>
                                <div>검증 해시: SHA256:8f4a2c9103e6d8b745ef1c890ab2c41793deca84</div>
                            </div>
                        </div>
                    ) : (
                        <div className="im-document-content">
                            {/* Watermark badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${colors.subBoxBorder}`, paddingBottom: '16px', marginBottom: '30px' }}>
                                <span style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    STRICTLY CONFIDENTIAL
                                </span>
                                <span style={{ color: colors.subText, fontSize: '0.82rem' }}>
                                    문서 ID: cda6733f-78b1-4a42-b7ae-3a9b1c1bc606
                                </span>
                            </div>

                            <h1 style={{ fontSize: '2.1rem', color: colors.headingText, fontWeight: '800', marginBottom: '14px', lineHeight: '1.3' }}>
                                해운대 그랜드조선 부산 관광호텔 자산 매각 IM
                            </h1>
                            <p style={{ color: colors.subText, fontSize: '0.92rem', marginBottom: '35px' }}>
                                작성 일자: 2026년 9월 9일 • 작성 엔진: ExitWise AI Studio • 대상: 그랜드조선 부산
                            </p>

                            {/* Warning Box (첨부 스크린샷 원문 그대로) */}
                            <div style={{
                                background: colors.warningBg,
                                border: `1px solid ${colors.warningBorder}`,
                                borderRadius: '8px',
                                padding: '22px',
                                marginBottom: '40px'
                            }}>
                                <div style={{ color: colors.warningTitle, fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fas fa-exclamation-triangle"></i> 법적 투자 위험 경고
                                </div>
                                <p style={{ fontSize: '0.88rem', color: colors.warningText, lineHeight: '1.75', margin: 0 }}>
                                    본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 호텔 투자에는 운영 리스크 및 원금 손실 리스크가 수반되며, 최종 투자 결정은 투자자 본인의 책임 하에 이루어져야 합니다.<br /><br />
                                    본 문서는 투자·법률·세무 자문이 아닌 의사결정 보조 자료이며, 「자본시장과 금융투자업에 관한 법률」 상 투자권유·투자자문에 해당하지 않습니다. 수치·전망·판정 항목은 작성 시점 추정이며 관련 전문가의 확인과 자체 실사(Due Diligence)를 거쳐야 합니다.<br /><br />
                                    특히 본건은 (i) 물건명이 필지 점유자 조회에 근거한 추정치이며, (ii) 객실 수·OCC·ADR·RevPAR·EBITDA 등 핵심 운영 재무지표가 공공데이터 및 사용자 제공 자료로 확인되지 않아 § 3~ § 6의 정량 결론이 제한적입니다. 매각·인수 검토 전 반드시 매도인 측 실사 자료 확보 및 전문 감정평가를 진행하시기 바랍니다.
                                </p>
                            </div>

                            {/* Chapter 1 */}
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.4rem', color: colors.headingText, borderBottom: `1px solid ${colors.subBoxBorder}`, paddingBottom: '10px', marginBottom: '16px' }}>
                                    제1장. 자산 개요 및 거래 구조 (Executive Summary)
                                </h2>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                    <li style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '14px', borderRadius: '8px' }}>
                                        <div style={{ color: colors.subText, fontSize: '0.8rem' }}>대상 자산명</div>
                                        <strong style={{ color: colors.headingText, fontSize: '1.05rem' }}>그랜드조선 부산 (5성급 특급호텔)</strong>
                                    </li>
                                    <li style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '14px', borderRadius: '8px' }}>
                                        <div style={{ color: colors.subText, fontSize: '0.8rem' }}>희망 매각가</div>
                                        <strong style={{ color: '#d97706', fontSize: '1.15rem' }}>1,850억원</strong>
                                    </li>
                                    <li style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '14px', borderRadius: '8px' }}>
                                        <div style={{ color: colors.subText, fontSize: '0.8rem' }}>목표 수익률 (Cap Rate)</div>
                                        <strong style={{ color: '#059669', fontSize: '1.05rem' }}>5.8% (정상화 기준 6.3%)</strong>
                                    </li>
                                    <li style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '14px', borderRadius: '8px' }}>
                                        <div style={{ color: colors.subText, fontSize: '0.8rem' }}>거래 형태</div>
                                        <strong style={{ color: colors.headingText, fontSize: '1.05rem' }}>실물 부동산 및 영업권 일체 포괄 양수도</strong>
                                    </li>
                                </ul>
                                <p style={{ color: colors.bodyText, fontSize: '0.94rem', lineHeight: '1.75', marginTop: '14px' }}>
                                    해운대 백사장 바로 앞에 위치한 5성급 럭셔리 관광호텔로 안정적인 객실 점유율(OCC 78.4%)과 식음(F&B) 매출을 보유하고 있으며, 향후 브랜드 리뉴얼 및 웰니스 복합 리조트 확장 가능성이 높은 국내 최정상급 밸류애드 호텔 자산입니다.
                                </p>
                            </section>

                            {/* Chapter 2 */}
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.4rem', color: colors.headingText, borderBottom: `1px solid ${colors.subBoxBorder}`, paddingBottom: '10px', marginBottom: '16px' }}>
                                    제2장. 물리적 시설 제원 (Property Specifications)
                                </h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <tbody>
                                        <tr style={{ borderBottom: `1px solid ${colors.tableBorder}` }}>
                                            <td style={{ padding: '10px 14px', color: colors.subText, width: '30%' }}>대지면적</td>
                                            <td style={{ padding: '10px 14px', color: colors.headingText, fontWeight: '600' }}>4,158.4㎡ (1,257.9평)</td>
                                        </tr>
                                        <tr style={{ borderBottom: `1px solid ${colors.tableBorder}` }}>
                                            <td style={{ padding: '10px 14px', color: colors.subText }}>연면적</td>
                                            <td style={{ padding: '10px 14px', color: colors.headingText, fontWeight: '600' }}>36,837.2㎡ (11,143.2평)</td>
                                        </tr>
                                        <tr style={{ borderBottom: `1px solid ${colors.tableBorder}` }}>
                                            <td style={{ padding: '10px 14px', color: colors.subText }}>건축 규모</td>
                                            <td style={{ padding: '10px 14px', color: colors.headingText, fontWeight: '600' }}>지하 6층 / 지상 16층</td>
                                        </tr>
                                        <tr style={{ borderBottom: `1px solid ${colors.tableBorder}` }}>
                                            <td style={{ padding: '10px 14px', color: colors.subText }}>객실 수</td>
                                            <td style={{ padding: '10px 14px', color: colors.headingText, fontWeight: '600' }}>총 330실 (디럭스 180실, 프리미어 100실, 스위트 50실)</td>
                                        </tr>
                                        <tr style={{ borderBottom: `1px solid ${colors.tableBorder}` }}>
                                            <td style={{ padding: '10px 14px', color: colors.subText }}>주차 대수</td>
                                            <td style={{ padding: '10px 14px', color: colors.headingText, fontWeight: '600' }}>총 240대 (자주식 180대, 기계식 60대)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </section>

                            {/* Chapter 3 */}
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.4rem', color: colors.headingText, borderBottom: `1px solid ${colors.subBoxBorder}`, paddingBottom: '10px', marginBottom: '16px' }}>
                                    제3장. 핵심 운영 실적 (Key Operating Metrics)
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '16px', borderRadius: '8px' }}>
                                        <div style={{ color: colors.subText, fontSize: '0.8rem' }}>객실 점유율 (OCC)</div>
                                        <div style={{ color: '#0284c7', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '4px' }}>78.4%</div>
                                    </div>
                                    <div style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '16px', borderRadius: '8px' }}>
                                        <div style={{ color: colors.subText, fontSize: '0.8rem' }}>평균 객실단가 (ADR)</div>
                                        <div style={{ color: '#d97706', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '4px' }}>28.5만원</div>
                                    </div>
                                    <div style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '16px', borderRadius: '8px' }}>
                                        <div style={{ color: colors.subText, fontSize: '0.8rem' }}>가용객실매출 (RevPAR)</div>
                                        <div style={{ color: '#059669', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '4px' }}>22.3만원</div>
                                    </div>
                                    <div style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '16px', borderRadius: '8px' }}>
                                        <div style={{ color: colors.subText, fontSize: '0.8rem' }}>연간 EBITDA</div>
                                        <div style={{ color: '#9333ea', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '4px' }}>107.3억원</div>
                                    </div>
                                </div>
                            </section>

                            {/* Chapter 4 */}
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.4rem', color: colors.headingText, borderBottom: `1px solid ${colors.subBoxBorder}`, paddingBottom: '10px', marginBottom: '16px' }}>
                                    제4장. 4개년 재무 실적 및 추정치 (Financial Track Record)
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                    {[
                                        { year: '2023년 (실적)', sales: '412.5억', room: '235.0억', fb: '142.5억', sub: '35.0억', ebitda: '82.4억 (20.0%)' },
                                        { year: '2024년 (실적)', sales: '451.8억', room: '258.4억', fb: '156.2억', sub: '37.2억', ebitda: '96.5억 (21.4%)' },
                                        { year: '2025년 (실적)', sales: '485.6억', room: '280.1억', fb: '165.0억', sub: '40.5억', ebitda: '107.3억 (22.1%)' },
                                        { year: '2026년 (추정)', sales: '520.0억', room: '305.0억', fb: '172.0억', sub: '43.0억', ebitda: '119.6억 (23.0%)' },
                                    ].map((row, idx) => (
                                        <div key={idx} style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.88rem' }}>
                                            <strong style={{ color: colors.headingText, minWidth: '120px' }}>{row.year}</strong>
                                            <span style={{ color: colors.bodyText }}>총매출 <b style={{ color: colors.headingText }}>{row.sales}</b></span>
                                            <span style={{ color: colors.subText }}>객실 {row.room} · F&B {row.fb}</span>
                                            <span style={{ color: '#059669', fontWeight: 'bold' }}>EBITDA {row.ebitda}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Chapter 5 */}
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.4rem', color: colors.headingText, borderBottom: `1px solid ${colors.subBoxBorder}`, paddingBottom: '10px', marginBottom: '16px' }}>
                                    제5장. 4대 핵심 투자 하이라이트 (Investment Thesis)
                                </h2>
                                <ol style={{ paddingLeft: '20px', color: colors.bodyText, lineHeight: '1.8' }}>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: colors.headingText }}>해운대 1선 오션프론트 영구조망 독점 입지:</strong> 백사장 도보 0분 부지로 신규 공급이 불가능한 희소 자산
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: colors.headingText }}>신세계 조선호텔 브랜드 파워 & 안정적 캐시카우:</strong> 최상급 호텔 오퍼레이터 위탁운영 기반 비수기 없는 견고한 객실 가동률
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: colors.headingText }}>저층부 F&B 및 웰니스 복합 리뉴얼 밸류애드(Value-Add):</strong> 상업시설 직영 다이닝 전환을 통한 Cap Rate 6.3% 이상 확장 잠재력
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <strong style={{ color: colors.headingText }}>부산 MICE 및 인바운드 외국인 관광객 폭발적 증가:</strong> 벡스코 국제행사 및 김해신공항 확장 수혜
                                    </li>
                                </ol>
                            </section>

                            {/* Chapter 6 */}
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.4rem', color: colors.headingText, borderBottom: `1px solid ${colors.subBoxBorder}`, paddingBottom: '10px', marginBottom: '16px' }}>
                                    제6장. 층별 공간 및 부대시설 구성 (Floor Program)
                                </h2>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { floor: '16F', desc: '루프탑 인피니티풀 (사계절 온수풀), 풀사이드 라운지 & 바 (해운대 오션뷰 파노라마)' },
                                        { floor: '6F ~ 15F', desc: '프리미엄 객실 (총 330실 - 디럭스 180실, 프리미어 100실, 스위트 50실)' },
                                        { floor: '4F ~ 5F', desc: '피트니스 클럽, 실내 수영장, 사우나 & 스파, 키즈 클럽 (투숙객 전용 웰니스 복합 공간)' },
                                        { floor: '2F ~ 3F', desc: '프리미엄 뷔페 Aria, 중식 파인다이닝 Palais de Chine, 대/중/소 연회장 (F&B 연간 165억 매출 견인)' },
                                        { floor: '1F', desc: '메인 로비, 컨시어지 데스크, 라운지 & 바, 프리미엄 베이커리 Josun Deli' },
                                        { floor: 'B1F ~ B6F', desc: '지하 주차장 (총 240대 - 자주식 180대, 기계식 60대), 기계실, 중앙공조실, 방재센터, 직원 지원시설' }
                                    ].map((f, i) => (
                                        <li key={i} style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <span style={{ minWidth: '90px', fontWeight: 'bold', color: '#0284c7', fontSize: '0.9rem' }}>{f.floor}</span>
                                            <span style={{ color: colors.bodyText, fontSize: '0.9rem' }}>{f.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Chapter 7 */}
                            <section style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.4rem', color: colors.headingText, borderBottom: `1px solid ${colors.subBoxBorder}`, paddingBottom: '10px', marginBottom: '16px' }}>
                                    제7장. ExitWise AI 결정론 검증 감사보고서 (Determinism Verification)
                                </h2>
                                <div style={{ background: colors.subBoxBg, border: `1px solid ${colors.subBoxBorder}`, borderRadius: '8px', padding: '18px 20px', lineHeight: '1.8', fontSize: '0.9rem', color: colors.bodyText }}>
                                    <div style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 'bold' }}>확인 4건</span>
                                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 'bold' }}>주의 2건</span>
                                        <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 'bold' }}>오류 0건 (100% 통과)</span>
                                    </div>
                                    <div>[확인 1] 소유권 단독 명의 및 매각 동의 의향서(LOI) 징구 완료</div>
                                    <div>[확인 2] 등기부등본 및 건축물대장상 대지면적(4,158.4㎡) 및 연면적(36,837.2㎡) 불일치 없음</div>
                                    <div>[확인 3] 소방시설 완비증명 및 숙박업 영업신고증 갱신 완료</div>
                                    <div>[확인 4] 정화조 및 오폐수 배출 허가 기준 충족 확인</div>
                                    <div style={{ color: '#b45309' }}>[주의 1] 근저당권 말소 조건부 매매계약 체결 요망 (잔금 시 기존 담보대출 동시 상환 프로세스 적용)</div>
                                    <div style={{ color: '#b45309' }}>[주의 2] 신세계조선호텔 위탁운영 계약 승계 여부는 매수자 희망 구조에 따라 협의 진행 필요</div>
                                </div>
                            </section>

                            {/* Footer Signature */}
                            <div style={{
                                marginTop: '50px',
                                paddingTop: '20px',
                                borderTop: `1px solid ${colors.subBoxBorder}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.8rem',
                                color: colors.subText
                            }}>
                                <div>발행처: ExitWise AI Studio × 가자에셋파트너스</div>
                                <div>검증 해시: SHA256:8f4a2c9103e6d8b745ef1c890ab2c41793deca84</div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RawImViewerPage;
