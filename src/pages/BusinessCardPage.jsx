import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const PEOPLE_DATA = {
    leesangsoo: {
        id: 'leesangsoo',
        nameKo: '이 상 수',
        nameEn: 'SANG SOO LEE',
        title: '대표이사',
        cert: '공인중개사 · 투자자산운용사',
        company: '(주)가자에셋파트너스',
        phone: '010-5439-5353',
        secondLabel: 'F.',
        secondContact: '0504-331-5353',
        email: 'wise@exitwise.io',
        address: '경기도 성남시 분당구 수내로 54, 삼성보보스쉐르빌 2707호',
        website: 'www.gajaasset.com',
        services: '경매 · NPL · 투자 · 대출 · 중개 · 매매 · 컨설팅'
    },
    jeongjaewon: {
        id: 'jeongjaewon',
        nameKo: '정 재 원',
        nameEn: 'JAE WON CHUNG',
        title: '영업팀장',
        cert: '',
        company: '(주)가자에셋파트너스',
        phone: '010-8916-1305',
        secondLabel: 'T.',
        secondContact: '02-6455-7063',
        email: 'ickra345@gmail.com',
        address: '경기도 성남시 분당구 수내로 54, 삼성보보스쉐르빌 2707호',
        website: 'www.gajaasset.com',
        services: '경매 · NPL · 투자 · 대출 · 중개 · 매매 · 컨설팅'
    }
};

const THEMES_CONFIG = {
    navy: {
        name: '미드나이트 네이비',
        badgeColor: '#0a1928',
        textColor: '#D4AF37',
        bgFront: '#0a1928',
        bgBackBand: '#0a1928',
        bgBackMain: '#FAF7F0',
        textFront: '#F8F4E6',
        goldFront: '#D4AF37',
        textCorp: '#0a1928',
        textName: '#0f1923',
        textSub: '#6B7280',
        lineColor: 'rgba(212, 175, 55, 0.5)',
        contactVal: '#141E28',
        contactLbl: '#BE962D',
        previewBorder: 'rgba(212, 175, 55, 0.4)'
    },
    ivory: {
        name: '아키텍처 아이보리',
        badgeColor: '#FAF7F0',
        textColor: '#0a1928',
        bgFront: '#FAF7F0',
        bgBackBand: '#FAF7F0',
        bgBackMain: '#0a1928',
        textFront: '#0a1928',
        goldFront: '#BE962D',
        textCorp: '#F8F4E6',
        textName: '#FFFFFF',
        textSub: '#B9AA8C',
        lineColor: 'rgba(212, 175, 55, 0.4)',
        contactVal: '#F0F0F5',
        contactLbl: '#D4AF37',
        previewBorder: 'rgba(255, 255, 255, 0.2)'
    },
    emerald: {
        name: '딥 에메랄드',
        badgeColor: '#122A21',
        textColor: '#D4AF37',
        bgFront: '#122A21',
        bgBackBand: '#122A21',
        bgBackMain: '#FAF7F0',
        textFront: '#F8F4E6',
        goldFront: '#D4AF37',
        textCorp: '#122A21',
        textName: '#12231C',
        textSub: '#5A6E64',
        lineColor: 'rgba(212, 175, 55, 0.5)',
        contactVal: '#14231E',
        contactLbl: '#BE962D',
        previewBorder: 'rgba(212, 175, 55, 0.4)'
    }
};

const BusinessCardPage = () => {
    const [selectedPerson, setSelectedPerson] = useState('leesangsoo');
    const [selectedTheme, setSelectedTheme] = useState('navy');
    const [showBleedGuide, setShowBleedGuide] = useState(false);

    const person = PEOPLE_DATA[selectedPerson];
    const theme = THEMES_CONFIG[selectedTheme];

    const frontImgUrl = `/cards/card_front_${selectedTheme}.png`;
    const backImgUrl = `/cards/card_back_${selectedPerson}_${selectedTheme}.png`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="business-card-page" style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-white)' }}>
            <SEO title={`${person.nameKo} ${person.title} 공식 인쇄용 명함`} description="가자에셋파트너스 공식 90x50mm 인쇄용 명함 시스템" />

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 80px' }}>
                
                {/* Header Controls (Screen Only) */}
                <div className="no-print" style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid var(--accent-gold)', marginBottom: '15px' }}>
                        <i className="fas fa-id-card" style={{ color: 'var(--accent-gold)' }}></i>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>공식 인쇄 규격 90 × 50mm (도련 3mm)</span>
                    </div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: '"Noto Serif KR", serif', marginBottom: '12px', background: 'var(--accent-gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        GajaAsset Partners 명함 인쇄 시스템
                    </h1>
                    <p style={{ color: 'var(--text-gray)', fontSize: '1rem', maxWidth: '680px', margin: '0 auto 30px' }}>
                        성원애드피아, 오프린트미 등 인쇄소 접수 규격(300 DPI, 96×56mm 도련 포함)에 최적화된 고해상도 인쇄본과 원클릭 브라우저 PDF 출력을 지원합니다.
                    </p>

                    {/* Selector Controls Bar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', background: 'var(--glass-card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        
                        {/* Person Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>인물 선택:</span>
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <button
                                    onClick={() => setSelectedPerson('leesangsoo')}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: selectedPerson === 'leesangsoo' ? 'var(--accent-gold)' : 'transparent',
                                        color: selectedPerson === 'leesangsoo' ? '#000' : 'var(--text-white)',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    이상수 대표이사
                                </button>
                                <button
                                    onClick={() => setSelectedPerson('jeongjaewon')}
                                    style={{
                                        padding: '8px 18px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: selectedPerson === 'jeongjaewon' ? 'var(--accent-gold)' : 'transparent',
                                        color: selectedPerson === 'jeongjaewon' ? '#000' : 'var(--text-white)',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    정재원 영업팀장
                                </button>
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>컬러 테마:</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {Object.entries(THEMES_CONFIG).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedTheme(key)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            border: selectedTheme === key ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                                            background: selectedTheme === key ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.2)',
                                            color: selectedTheme === key ? 'var(--accent-gold)' : 'var(--text-white)',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: cfg.badgeColor, border: '1px solid rgba(255,255,255,0.4)', display: 'inline-block' }}></span>
                                        {cfg.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => setShowBleedGuide(!showBleedGuide)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: showBleedGuide ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                                    color: showBleedGuide ? 'var(--accent-gold)' : 'var(--text-gray)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fas fa-crop-alt" style={{ marginRight: '6px' }}></i>
                                {showBleedGuide ? '재단선 끄기' : '재단선(3mm) 보기'}
                            </button>
                            <a
                                href={`/cards/preview_sheet_${selectedPerson}.png`}
                                download={`gaja_preview_sheet_${selectedPerson}.png`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(212, 175, 55, 0.4)',
                                    background: 'rgba(212, 175, 55, 0.1)',
                                    color: 'var(--accent-gold)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fas fa-file-image"></i>
                                3색 시안 시트 다운로드
                            </a>
                            <button
                                onClick={handlePrint}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '9px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--accent-gold-gradient)',
                                    color: '#000',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.35)'
                                }}
                            >
                                <i className="fas fa-print"></i>
                                인쇄 / PDF 저장
                            </button>
                        </div>

                    </div>
                </div>

                {/* Cards Display Grid */}
                <div className="cards-print-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '35px', marginBottom: '50px' }}>
                    
                    {/* Front Card */}
                    <div className="card-item-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px', marginBottom: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                                <i className="fas fa-layer-group" style={{ marginRight: '8px' }}></i>앞면 (Front)
                            </span>
                            <a
                                href={frontImgUrl}
                                download={`gaja_card_front_${selectedTheme}.png`}
                                style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', textDecoration: 'none', background: 'rgba(212,175,55,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)' }}
                            >
                                <i className="fas fa-download" style={{ marginRight: '5px' }}></i>300 DPI 다운로드
                            </a>
                        </div>
                        
                        {/* Physical Print Preview Card (Aspect 90:50) */}
                        <div 
                            className="card-surface print-page" 
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                aspectRatio: '90 / 50',
                                borderRadius: showBleedGuide ? '0' : '8px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                                border: showBleedGuide ? '2px dashed #EF4444' : `1px solid ${theme.previewBorder}`,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <img 
                                src={frontImgUrl} 
                                alt="명함 앞면" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            />
                            {showBleedGuide && (
                                <div style={{ position: 'absolute', top: '3.1%', left: '3.1%', right: '3.1%', bottom: '3.1%', border: '1px solid #10B981', pointerEvents: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '4px' }}>
                                    <span style={{ background: '#10B981', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px', fontWeight: 700 }}>실제 재단선 90×50mm</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Back Card */}
                    <div className="card-item-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px', marginBottom: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                                <i className="fas fa-address-card" style={{ marginRight: '8px' }}></i>뒷면 (Back)
                            </span>
                            <a
                                href={backImgUrl}
                                download={`gaja_card_back_${selectedPerson}_${selectedTheme}.png`}
                                style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', textDecoration: 'none', background: 'rgba(212,175,55,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)' }}
                            >
                                <i className="fas fa-download" style={{ marginRight: '5px' }}></i>300 DPI 다운로드
                            </a>
                        </div>

                        {/* Physical Print Preview Card (Aspect 90:50) */}
                        <div 
                            className="card-surface print-page" 
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                aspectRatio: '90 / 50',
                                borderRadius: showBleedGuide ? '0' : '8px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                                border: showBleedGuide ? '2px dashed #EF4444' : `1px solid ${theme.previewBorder}`,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <img 
                                src={backImgUrl} 
                                alt="명함 뒷면" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            />
                            {showBleedGuide && (
                                <div style={{ position: 'absolute', top: '3.1%', left: '3.1%', right: '3.1%', bottom: '3.1%', border: '1px solid #10B981', pointerEvents: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '4px' }}>
                                    <span style={{ background: '#10B981', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '2px', fontWeight: 700 }}>실제 재단선 90×50mm</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Print & Order Guide (Screen Only) */}
                <div className="no-print" style={{ background: 'var(--glass-card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '30px', marginTop: '40px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-info-circle"></i>인쇄소(오프린트미, 성원애드피아 등) 발주 가이드라인
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', fontSize: '0.9rem', color: 'var(--text-gray)', lineHeight: '1.7' }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <strong style={{ color: 'var(--text-white)', display: 'block', marginBottom: '6px' }}>1. 규격 설정</strong>
                            • 완성 사이즈: <strong>90mm × 50mm</strong><br />
                            • 작업(도련) 사이즈: <strong>96mm × 56mm</strong> (상하좌우 3mm 여백 포함)<br />
                            • 해상도: <strong>300 DPI</strong> (1134 × 661 px)
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <strong style={{ color: 'var(--text-white)', display: 'block', marginBottom: '6px' }}>2. 권장 용지 선택</strong>
                            • <strong>랑데뷰 울트라화이트 310g</strong> (두텁고 자연스러운 최고급 재질)<br />
                            • <strong>엑스트라 매트 300g</strong> (차분하고 매트한 프리미엄 감촉)<br />
                            • <strong>아르떼 울트라화이트 310g</strong> (부드럽고 고급스러운 인쇄성)
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <strong style={{ color: 'var(--text-white)', display: 'block', marginBottom: '6px' }}>3. 추천 후가공 옵션</strong>
                            • <strong>샴페인 무광 골드 박(Foil Stamping)</strong>: 앞면 로고 및 슬로건에 적용 시 극대화된 럭셔리감<br />
                            • <strong>모서리 귀도리(라운딩)</strong>: 3R 또는 4R 부드러운 모서리 마감
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                            ※ 브라우저에서 '인쇄 / PDF 저장' 클릭 시 머리글/바닥글 옵션을 해제하고 배경 그래픽을 켜주세요.
                        </span>
                        <Link to="/" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                            홈으로 돌아가기 <i className="fas fa-arrow-right" style={{ marginLeft: '5px' }}></i>
                        </Link>
                    </div>
                </div>

            </div>

            {/* Print Specific CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    /* Hide site elements */
                    .navbar, .footer, .no-print, nav, footer {
                        display: none !important;
                    }
                    body, html {
                        background: #fff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .business-card-page {
                        padding: 0 !important;
                        min-height: auto !important;
                        background: transparent !important;
                    }
                    .container {
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .cards-print-container {
                        display: block !important;
                        margin: 0 !important;
                        gap: 0 !important;
                    }
                    .card-item-wrapper {
                        page-break-after: always !important;
                        break-after: page !important;
                        margin: 0 !important;
                        padding: 20mm !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                    }
                    .print-page {
                        width: 90mm !important;
                        height: 50mm !important;
                        max-width: 90mm !important;
                        box-shadow: none !important;
                        border: 1px solid #ddd !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}} />
        </div>
    );
};

export default BusinessCardPage;
