import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { YieldCalculator } from '../components/calculator/YieldCalculator';
import { WealthSimulator } from '../components/calculator/WealthSimulator';
import { TrustBadge } from '../components/trust/TrustBadge';
import SEO from '../components/SEO';
import DataManager from '../utils/DataManager';
import { useTheme } from '../context/ThemeContext';
import ExitWiseMarkdownViewer from '../components/im/ExitWiseMarkdownViewer';

const parseKoreanCurrency = (str) => {
    if (!str) return 0;
    const cleanStr = String(str).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    if (String(str).includes('억')) return num * 100000000;
    return num || 0;
};

const ListingDetailPage = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
    const [deckPage, setDeckPage] = useState(1);
    const [copiedNotice, setCopiedNotice] = useState(false);
    const { openConsulting } = useOutletContext() || {};
    const { isDark } = useTheme();

    useEffect(() => {
        window.scrollTo(0, 0);
        DataManager.init();
        const found = DataManager.getListingById(id);
        if (found) {
            setListing(found);
            // ExitWise 연동 매물인 경우 즉시 IM 전문 탭을 기본 활성화
            if (found.isExitwiseLinked) {
                setActiveTab('exitwise');
            }
        }
    }, [id]);

    const openRawImWindow = () => {
        const width = 980;
        const height = 960;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        const targetId = listing?.id || id || '';
        window.open(
            `/im-raw-viewer?id=${targetId}`,
            'ExitWiseRawIM',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShareOrCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopiedNotice(true);
            setTimeout(() => setCopiedNotice(false), 2500);
        } else {
            alert('링크가 복사되었습니다: ' + window.location.href);
        }
    };

    if (!listing) {
        return (
            <div style={{ padding: '200px 20px', textAlign: 'center', color: 'var(--text-white)' }}>
                <h2>매물을 찾을 수 없습니다.</h2>
                <Link to="/listings" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>목록으로 돌아가기</Link>
            </div>
        );
    }

    const isGeneral = listing.type === 'general';
    const isNpl = listing.type === 'npl';
    const isAuction = listing.type === 'auction' || !listing.type;
    const isExitwise = Boolean(listing.isExitwiseLinked);

    const tabs = isExitwise ? [
        {
            id: 'exitwise',
            label: 'ExitWise 공식 IM',
            sub: '투자설명서 전문',
            icon: 'fas fa-bolt',
            isExitwise: true,
            badge: 'AI IM'
        },
        {
            id: 'overview',
            label: '자산 개요',
            sub: 'Overview',
            icon: 'fas fa-building'
        },
        {
            id: 'analysis',
            label: '수익률 시뮬레이션',
            sub: 'Simulation Model',
            icon: 'fas fa-chart-line'
        },
        {
            id: 'location',
            label: '입지 분석',
            sub: 'Location Map',
            icon: 'fas fa-map-marked-alt'
        }
    ] : [
        {
            id: 'overview',
            label: '자산 개요',
            sub: 'Overview',
            icon: 'fas fa-building'
        },
        {
            id: 'analysis',
            label: '수익률 분석',
            sub: 'Investment Analysis',
            icon: 'fas fa-chart-line'
        },
        {
            id: 'location',
            label: '입지 분석',
            sub: 'Location Map',
            icon: 'fas fa-map-marked-alt'
        }
    ];

    // Theme adaptive styles helper
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const subCardBg = isDark ? 'rgba(255, 255, 255, 0.025)' : '#f8fafc';
    const subCardBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';

    return (
        <div className="listing-detail-page" style={{ background: 'var(--primary-navy)', minHeight: '100vh', color: 'var(--text-off-white)' }}>
            <SEO title={`${listing.title} | GAJA ASSET`} description={`${listing.location}에 위치한 프리미엄 ${listing.category} 자산입니다.`} />

            {/* Hero Section */}
            <section style={{ height: '62vh', position: 'relative', overflow: 'hidden' }}>
                <motion.div
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    style={{
                        backgroundImage: `url(${listing.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        opacity: isDark ? 0.55 : 0.85
                    }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '60%',
                    background: isDark
                        ? 'linear-gradient(to top, var(--primary-navy), transparent)'
                        : 'linear-gradient(to top, var(--primary-navy) 20%, rgba(248,249,252,0.8) 60%, transparent 100%)'
                }} />

                <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '60px' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ maxWidth: '900px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            {/* Type Badge */}
                            {isGeneral && (
                                <span style={{ background: '#10b981', color: 'white', padding: '5px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    일반매물 (매매/급매)
                                </span>
                            )}
                            {isNpl && (
                                <span style={{ background: '#a855f7', color: 'white', padding: '5px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    NPL (부실채권 론세일)
                                </span>
                            )}
                            {isAuction && (
                                <span style={{ background: 'var(--accent-gold)', color: '#000', padding: '5px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    법원 경매
                                </span>
                            )}

                            {/* Category Badge */}
                            <span style={{
                                background: listing.category === '호텔' ? '#0ea5e9' : listing.category === '오피스빌딩' ? '#6366f1' : 'rgba(255,255,255,0.15)',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}>
                                {listing.category}
                            </span>

                            {/* ExitWise Badge */}
                            {isExitwise && (
                                <span style={{
                                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                                    color: 'white',
                                    padding: '5px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
                                }}>
                                    <i className="fas fa-bolt"></i> ExitWise AI IM 연동
                                </span>
                            )}

                            <TrustBadge />
                        </div>

                        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2', color: 'var(--text-white)' }}>
                            {listing.title}
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-gray)', margin: 0 }}>
                            <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-gold)', marginRight: '10px' }}></i>{listing.location}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section style={{ padding: '60px 0 150px' }}>
                <div className="container">
                    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                        {/* Left: Main Tabs & Info */}
                        <div style={{ flex: 2, minWidth: '320px' }}>
                            {/* Navigation Tabs (Luxury Grid Segmented Bar, No Scrollbar) */}
                            <nav
                                className={`detail-tabs-nav ${tabs.length === 4 ? 'has-4-tabs' : 'has-3-tabs'}`}
                                aria-label="매물 상세 정보 탭 네비게이션"
                            >
                                {tabs.map(tab => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`detail-tab-btn ${isActive ? 'is-active' : ''} ${tab.isExitwise && isActive ? 'is-exitwise' : ''}`}
                                            type="button"
                                        >
                                            <div className="tab-top-row">
                                                <i
                                                    className={`${tab.icon} tab-icon`}
                                                    style={{
                                                        color: tab.isExitwise && isActive
                                                            ? (isDark ? '#38bdf8' : '#0284c7')
                                                            : isActive
                                                                ? 'var(--accent-gold)'
                                                                : 'inherit'
                                                    }}
                                                ></i>
                                                <span>{tab.label}</span>
                                                {tab.badge && (
                                                    <span className="tab-badge">{tab.badge}</span>
                                                )}
                                            </div>
                                            {tab.sub && (
                                                <span className="tab-sub-label">{tab.sub}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Tab 1: Overview */}
                                    {activeTab === 'overview' && (
                                        <div className="glass-card" style={{ padding: '40px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderLeft: '4px solid var(--accent-gold)', paddingLeft: '15px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-white)' }}>핵심 거래 지표</h3>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>업데이트: 2026.09</span>
                                            </div>

                                            {/* Dynamic Metrics by Transaction Type */}
                                            {isGeneral && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                                                    <InfoItem label="희망 매매가" value={listing.salePrice || listing.minPrice} highlight icon="fa-coins" />
                                                    <InfoItem label="연 예상 수익률" value={listing.roi || '5.8%'} highlight icon="fa-chart-line" />
                                                    <InfoItem label="임대 보증금" value={listing.deposit || '30억'} icon="fa-wallet" />
                                                    <InfoItem label="월 임대료" value={listing.monthlyRent || '8.5억'} icon="fa-money-bill-wave" />
                                                    <InfoItem label="평당가" value={listing.pricePerPyung || '1억 4,700만'} icon="fa-vector-square" />
                                                    <InfoItem label="자산 용도" value={listing.category} icon="fa-building" />
                                                </div>
                                            )}

                                            {isNpl && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                                                    <InfoItem label="NPL 매각희망가" value={listing.nplTargetPrice || listing.minPrice} highlight icon="fa-hand-holding-usd" />
                                                    <InfoItem label="채권최고액" value={listing.claimMax || '156억'} icon="fa-file-invoice-dollar" />
                                                    <InfoItem label="채권원금(OPB)" value={listing.opb || '120억'} icon="fa-balance-scale" />
                                                    <InfoItem label="담보 감정평가액" value={listing.collateralValue || '145억'} icon="fa-shield-alt" />
                                                    <InfoItem label="예상 배당회수금" value={listing.expectedDividend || '118억'} highlight icon="fa-chart-pie" />
                                                    <InfoItem label="할인율" value={listing.rate || '61%'} icon="fa-percentage" />
                                                </div>
                                            )}

                                            {isAuction && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                                                    <InfoItem label="감정가" value={listing.appraisal} icon="fa-balance-scale" />
                                                    <InfoItem label="최저입찰가" value={listing.minPrice} highlight icon="fa-tag" />
                                                    <InfoItem label="최저가율" value={listing.rate} icon="fa-chart-pie" />
                                                    <InfoItem label="사건번호" value={listing.caseNumber || '2025타경10482'} icon="fa-gavel" />
                                                    <InfoItem label="입찰기일" value={listing.auctionDate || '2026-10-22'} icon="fa-calendar-alt" />
                                                    <InfoItem label="관할법원" value={listing.court || '서울중앙지방법원'} icon="fa-landmark" />
                                                </div>
                                            )}

                                            {/* Specs: 오피스빌딩, 호텔 맞춤 상세 제원 */}
                                            <div style={{ marginTop: '20px', paddingTop: '30px', borderTop: `1px solid ${subCardBorder}` }}>
                                                <h4 style={{ color: 'var(--text-white)', marginBottom: '20px', fontSize: '1.15rem' }}>자산 상세 제원 (Property Specs)</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                    <div>
                                                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>대지면적: </span>
                                                        <strong style={{ color: 'var(--text-white)' }}>{listing.specs?.landArea || listing.exitwiseData?.landArea || '4,158.4㎡ (1,257.9평)'}</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>연면적: </span>
                                                        <strong style={{ color: 'var(--text-white)' }}>{listing.specs?.totalFloorArea || listing.exitwiseData?.totalFloorArea || '36,837.2㎡ (11,143.2평)'}</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>규모/층수: </span>
                                                        <strong style={{ color: 'var(--text-white)' }}>{listing.specs?.floors || listing.exitwiseData?.floors || '지하 6층 / 지상 16층'}</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>{listing.category === '호텔' ? '객실 수: ' : '주차 대수: '}</span>
                                                        <strong style={{ color: 'var(--text-white)' }}>{listing.category === '호텔' ? (listing.exitwiseData?.rooms || '330실') : '자주식 140대'}</strong>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div style={{ marginTop: '30px', lineHeight: '1.8', color: 'var(--text-gray)' }}>
                                                <h4 style={{ color: 'var(--text-white)', marginBottom: '10px', fontSize: '1.1rem' }}>투자 포인트 요약</h4>
                                                <p style={{ color: 'var(--text-off-white)' }}>
                                                    {listing.exitwiseData?.executiveSummary ||
                                                        `본 물건은 ${listing.location} 핵심 상권 및 업무지구에 위치한 우량 실물자산입니다. 우수한 입지 조건과 자산 가치 상승 모멘텀을 보유하고 있으며, 전문 실사 및 권리분석을 완료하여 안정적인 현금흐름 창출이 가능합니다.`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab 2: ExitWise IM Report Tab (IB 최고급 투자설명서 전문) */}
                                    {activeTab === 'exitwise' && isExitwise && (
                                        <div className="exitwise-im-dossier" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                                            {/* Top Confidential IM Document Header */}
                                            <div className="glass-card" style={{
                                                padding: '30px 35px',
                                                borderRadius: '16px',
                                                border: isDark ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid rgba(14, 165, 233, 0.35)',
                                                background: isDark
                                                    ? 'linear-gradient(145deg, rgba(14, 165, 233, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                                    : 'linear-gradient(145deg, #f0f9ff 0%, #ffffff 100%)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 25px rgba(14, 165, 233, 0.08)'
                                            }}>
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '220px', height: '100%', background: 'radial-gradient(circle at top right, rgba(14,165,233,0.18), transparent 70%)', pointerEvents: 'none' }} />

                                                {/* Confidential Watermark Ribbon */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{
                                                            background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                                                            color: isDark ? '#f87171' : '#b91c1c',
                                                            border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #f87171',
                                                            padding: '4px 10px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '800',
                                                            letterSpacing: '1px'
                                                        }}>
                                                            STRICTLY CONFIDENTIAL
                                                        </span>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                                                            문서번호: <strong style={{ color: 'var(--text-white)' }}>{listing.exitwiseData?.imDocNumber || (listing.exitwiseData?.imDocumentId ? `IM-${listing.exitwiseData.imDocumentId.slice(0, 8).toUpperCase()}` : 'IM-2026-EW-01')}</strong>
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#0284c7', fontWeight: '600' }}>
                                                        <i className="fas fa-shield-alt"></i> ExitWise AI Determinism Certified (100% 무결성)
                                                    </div>
                                                </div>

                                                {/* Main IM Title & Quick Toolbar */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                                                    <div>
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                                            <i className="fas fa-file-alt"></i> OFFICIAL INVESTMENT MEMORANDUM
                                                        </div>
                                                        <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-white)', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                                                            {listing.exitwiseData?.imTitle || listing.title}
                                                        </h2>
                                                        <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.95rem' }}>
                                                            발행일: <strong style={{ color: 'var(--text-white)' }}>{listing.exitwiseData?.imDate || '2026.09.09'}</strong> • 발행처: <strong style={{ color: 'var(--text-white)' }}>ExitWise AI Studio × 가자에셋 Prime Asset Division</strong>
                                                        </p>
                                                    </div>

                                                    {/* Quick Actions */}
                                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                        <button
                                                            onClick={openRawImWindow}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '10px 16px',
                                                                fontWeight: '700',
                                                                fontSize: '0.9rem',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                                                            }}
                                                            title="채팅창에서 생성된 IM 원문만을 별도 팝업 창으로 띄워 확인합니다."
                                                        >
                                                            <i className="fas fa-external-link-alt"></i> 채팅창 IM 원문 별도창 보기
                                                        </button>

                                                        <button
                                                            onClick={() => setIsDeckModalOpen(true)}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '10px 18px',
                                                                fontWeight: '700',
                                                                fontSize: '0.9rem',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
                                                            }}
                                                        >
                                                            <i className="fas fa-expand-alt"></i> 전체화면 IM Deck 뷰어
                                                        </button>

                                                        <button
                                                            onClick={handlePrint}
                                                            style={{
                                                                background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                                                color: 'var(--text-white)',
                                                                border: `1px solid ${cardBorder}`,
                                                                borderRadius: '8px',
                                                                padding: '10px 16px',
                                                                fontWeight: '600',
                                                                fontSize: '0.9rem',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                        >
                                                            <i className="fas fa-print"></i> IM 인쇄 / PDF 저장
                                                        </button>

                                                        <Link
                                                            to="/exitwise-bridge"
                                                            target="_blank"
                                                            style={{
                                                                background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                                                color: 'var(--text-white)',
                                                                border: `1px solid ${cardBorder}`,
                                                                borderRadius: '8px',
                                                                padding: '10px 16px',
                                                                fontWeight: '600',
                                                                fontSize: '0.9rem',
                                                                textDecoration: 'none',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                        >
                                                            <i className="fas fa-desktop"></i> ExitWise 스튜디오 원문
                                                        </Link>

                                                        <button
                                                            onClick={handleShareOrCopy}
                                                            style={{
                                                                background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                                                color: copiedNotice ? 'var(--accent-gold)' : 'var(--text-white)',
                                                                border: `1px solid ${cardBorder}`,
                                                                borderRadius: '8px',
                                                                padding: '10px 14px',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                            title="매물 링크 복사"
                                                        >
                                                            <i className={`fas ${copiedNotice ? 'fa-check' : 'fa-share-alt'}`}></i>
                                                            {copiedNotice ? '복사완료' : '공유'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ExitWise IM 본문 동적 마크다운 렌더링 (원문 전문 표시) */}
                                            {listing.exitwiseData?.markdownContent ? (
                                                <ExitWiseMarkdownViewer markdown={listing.exitwiseData.markdownContent} isDark={isDark} />
                                            ) : (
                                                <>
                                                    {/* Chapter 1: Executive Summary & Deal Structure (Fallback Demo) */}
                                                    <div className="glass-card" style={{ padding: '35px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px' }}>
                                                    <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>1</span>
                                                    <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-white)' }}>Chapter 1. 자산 개요 및 거래 구조 (Executive Summary)</h3>
                                                </div>

                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                    gap: '18px',
                                                    marginBottom: '25px',
                                                    background: subCardBg,
                                                    padding: '24px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${subCardBorder}`
                                                }}>
                                                    <div>
                                                        <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>매각 대상 자산명</div>
                                                        <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.1rem' }}>{listing.exitwiseData?.assetName || '그랜드조선 부산'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>희망 매각가</div>
                                                        <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.25rem' }}>{listing.salePrice || '1,850억원'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>목표 수익률 (Cap Rate)</div>
                                                        <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.15rem' }}>{listing.exitwiseData?.capRate || '5.8% (정상화 6.3%)'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>총 객실 수</div>
                                                        <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.1rem' }}>{listing.exitwiseData?.rooms || '330실'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>대지면적</div>
                                                        <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.05rem' }}>{listing.exitwiseData?.landArea || '4,158.4㎡ (1,257.9평)'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>연면적</div>
                                                        <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.05rem' }}>{listing.exitwiseData?.totalFloorArea || '36,837.2㎡ (11,143.2평)'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>건축 규모</div>
                                                        <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.05rem' }}>{listing.exitwiseData?.floors || '지하 6층 / 지상 16층'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>주차 대수</div>
                                                        <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.05rem' }}>{listing.exitwiseData?.parking || '240대 (자주식 180대)'}</div>
                                                    </div>
                                                </div>

                                                <div style={{
                                                    background: isDark ? 'rgba(14, 165, 233, 0.05)' : '#f0f9ff',
                                                    borderLeft: '4px solid #0284c7',
                                                    padding: '16px 20px',
                                                    borderRadius: '0 8px 8px 0',
                                                    lineHeight: '1.7',
                                                    color: 'var(--text-off-white)',
                                                    fontSize: '0.96rem'
                                                }}>
                                                    <strong style={{ color: '#0284c7' }}>[Executive Summary]</strong> {listing.exitwiseData?.executiveSummary || '해운대 백사장 바로 앞에 위치한 5성급 럭셔리 관광호텔로 안정적인 객실 점유율(OCC 78%)과 식음(F&B) 매출을 보유하고 있으며, 향후 브랜드 리뉴얼 및 웰니스 복합 리조트 확장 가능성이 높은 국내 최정상급 밸류애드 호텔 자산입니다.'}
                                                </div>
                                            </div>

                                            {/* Chapter 2: Key Operational & Financial Metrics */}
                                            <div className="glass-card" style={{ padding: '35px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px' }}>
                                                    <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>2</span>
                                                    <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-white)' }}>Chapter 2. 핵심 운영 및 재무 실적 (Operating & Financials)</h3>
                                                </div>

                                                {/* KPI 3 Big Cards */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>객실 점유율 (OCC)</span>
                                                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>+6.2%p YoY</span>
                                                        </div>
                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0284c7' }}>78.4%</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>부산 5성급 평균(69.2%) 대비 우수</div>
                                                    </div>

                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>평균 객실 단가 (ADR)</div>
                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--accent-gold)' }}>285,000원</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>주말/성수기 420,000원 이상 실현</div>
                                                    </div>

                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>가용객실당 매출 (RevPAR)</div>
                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#10b981' }}>223,440원</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>전국 호텔 상위 5% 수준</div>
                                                    </div>

                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>연간 EBITDA (영업현금흐름)</div>
                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#9333ea' }}>107.3억원</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>EBITDA Margin 22.1% (매출 485.6억)</div>
                                                    </div>
                                                </div>

                                                {/* Financials Table */}
                                                <h4 style={{ color: 'var(--text-white)', marginBottom: '14px', fontSize: '1.05rem' }}>연도별 재무 및 현금흐름 추이 (단위: 억원)</h4>
                                                <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                                                        <thead>
                                                            <tr style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: 'var(--text-gray)', borderBottom: `1px solid ${subCardBorder}` }}>
                                                                <th style={{ textAlign: 'left', padding: '12px 14px' }}>구분</th>
                                                                <th style={{ padding: '12px 14px' }}>2023년 (실적)</th>
                                                                <th style={{ padding: '12px 14px' }}>2024년 (실적)</th>
                                                                <th style={{ padding: '12px 14px', color: 'var(--accent-gold)' }}>2025년 (실적)</th>
                                                                <th style={{ padding: '12px 14px', color: '#0284c7' }}>2026년 (추정)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}` }}>
                                                                <td style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 'bold', color: 'var(--text-white)' }}>총 매출액</td>
                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>412.5억</td>
                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>451.8억</td>
                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>485.6억</td>
                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0284c7' }}>520.0억</td>
                                                            </tr>
                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>- 객실 매출 (Room)</td>
                                                                <td style={{ padding: '10px 14px' }}>235.0억</td>
                                                                <td style={{ padding: '10px 14px' }}>258.4억</td>
                                                                <td style={{ padding: '10px 14px' }}>280.1억</td>
                                                                <td style={{ padding: '10px 14px' }}>305.0억</td>
                                                            </tr>
                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>- 식음료 매출 (F&B)</td>
                                                                <td style={{ padding: '10px 14px' }}>142.5억</td>
                                                                <td style={{ padding: '10px 14px' }}>156.2억</td>
                                                                <td style={{ padding: '10px 14px' }}>165.0억</td>
                                                                <td style={{ padding: '10px 14px' }}>172.0억</td>
                                                            </tr>
                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>- 부대시설 및 임대수익</td>
                                                                <td style={{ padding: '10px 14px' }}>35.0억</td>
                                                                <td style={{ padding: '10px 14px' }}>37.2억</td>
                                                                <td style={{ padding: '10px 14px' }}>40.5억</td>
                                                                <td style={{ padding: '10px 14px' }}>43.0억</td>
                                                            </tr>
                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, background: isDark ? 'rgba(14, 165, 233, 0.05)' : '#f0f9ff' }}>
                                                                <td style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 'bold', color: '#0284c7' }}>EBITDA (현금창출력)</td>
                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>82.4억</td>
                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>96.5억</td>
                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>107.3억</td>
                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#10b981' }}>119.6억</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-gray)' }}>EBITDA Margin</td>
                                                                <td style={{ padding: '10px 14px', color: 'var(--text-gray)' }}>20.0%</td>
                                                                <td style={{ padding: '10px 14px', color: 'var(--text-gray)' }}>21.4%</td>
                                                                <td style={{ padding: '10px 14px', color: 'var(--accent-gold)' }}>22.1%</td>
                                                                <td style={{ padding: '10px 14px', color: '#10b981' }}>23.0%</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Chapter 3: Core Investment Thesis (4대 투자 하이라이트) */}
                                            <div className="glass-card" style={{ padding: '35px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px' }}>
                                                    <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>3</span>
                                                    <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-white)' }}>Chapter 3. 4대 핵심 투자 하이라이트 (Investment Thesis)</h3>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                                    {(listing.exitwiseData?.highlights || [
                                                        {
                                                            title: "해운대 1선 오션프론트 영구조망 독점 입지",
                                                            desc: "해운대 백사장과 직접 연결되는 도보 0분 입지로, 희소가치가 극대화된 대한민국 1순위 해양 리조트 자산입니다."
                                                        },
                                                        {
                                                            title: "신세계 조선호텔앤리조트 브랜드 파워 & 안정적 캐시카우",
                                                            desc: "국내 최정상급 호텔 오퍼레이터의 위탁 운영 노하우와 멤버십 네트워크를 바탕으로 비수기 없는 견고한 객실 점유율(OCC 78%)을 확보했습니다."
                                                        },
                                                        {
                                                            title: "저층부 F&B 및 웰니스 복합 리뉴얼 밸류애드(Value-Add) 잠재력",
                                                            desc: "지하 및 저층부 상업시설의 하이엔드 다이닝 유치와 인피니티풀·스파 시설 리뉴얼을 통해 Cap Rate 6.3% 이상으로 즉각 상승시킬 수 있는 업사이드 잠재력을 보유합니다."
                                                        },
                                                        {
                                                            title: "부산 MICE 및 인바운드 외국인 관광객 폭발적 증가 수혜",
                                                            desc: "벡스코(BEXCO) 국제행사 및 김해신공항 확장, 외국인 VIP 관광객 증가로 ADR(객실 단가) 지속적 상향 여력이 충분합니다."
                                                        }
                                                    ]).map((hl, idx) => (
                                                        <div key={idx} style={{
                                                            background: subCardBg,
                                                            borderRadius: '12px',
                                                            padding: '22px',
                                                            border: `1px solid ${subCardBorder}`,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '10px'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <span style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    background: isDark ? 'rgba(14, 165, 233, 0.2)' : '#e0f2fe',
                                                                    color: '#0284c7',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    {idx + 1}
                                                                </span>
                                                                <strong style={{ color: 'var(--text-white)', fontSize: '1.02rem', lineHeight: '1.4' }}>{hl.title}</strong>
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-gray)', lineHeight: '1.65' }}>
                                                                {hl.desc}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Chapter 4: Floor-by-Floor Facility Plan */}
                                            <div className="glass-card" style={{ padding: '35px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px' }}>
                                                    <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>4</span>
                                                    <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-white)' }}>Chapter 4. 층별 공간 및 시설 구성 (Floor-by-Floor Program)</h3>
                                                </div>

                                                <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                        <thead>
                                                            <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9', color: 'var(--text-gray)', borderBottom: `1px solid ${subCardBorder}` }}>
                                                                <th style={{ width: '15%', padding: '12px 14px', textAlign: 'left' }}>층수</th>
                                                                <th style={{ width: '55%', padding: '12px 14px', textAlign: 'left' }}>용도 및 주요 시설</th>
                                                                <th style={{ width: '30%', padding: '12px 14px', textAlign: 'left' }}>특장점 / 비고</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(listing.exitwiseData?.floorPlan || [
                                                                { floor: "16F", use: "루프탑 인피니티풀 (사계절 온수풀), 풀사이드 라운지 & 바", note: "해운대 오션뷰 파노라마" },
                                                                { floor: "6F ~ 15F", use: "프리미엄 객실 (총 330실)", note: "디럭스 180실, 프리미어 100실, 스위트 50실" },
                                                                { floor: "4F ~ 5F", use: "피트니스 클럽, 실내 수영장, 사우나 & 스파, 키즈존", note: "투숙객 전용 웰니스 복합 공간" },
                                                                { floor: "2F ~ 3F", use: "뷔페 '아리아', 중식 파인다이닝 '팔레드신', 대/중 연회장", note: "F&B 연간 165억 매출 견인" },
                                                                { floor: "1F", use: "메인 로비, 컨시어지, 라운지&바, '조선델리' 베이커리", note: "해변 직접 연결 프리미엄 로비" },
                                                                { floor: "B1F ~ B6F", use: "지하 주차장 (240대 완비), 기계실, 전기실, 세탁/지원시설", note: "자주식 180대 / 기계식 60대" }
                                                            ]).map((item, idx) => (
                                                                <tr key={idx} style={{ borderBottom: `1px solid ${subCardBorder}` }}>
                                                                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0284c7' }}>{item.floor}</td>
                                                                    <td style={{ padding: '12px 14px', color: 'var(--text-white)' }}>{item.use}</td>
                                                                    <td style={{ padding: '12px 14px', color: 'var(--text-gray)' }}>{item.note}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Chapter 5: Determinism Verification Audit */}
                                            <div className="glass-card" style={{ padding: '35px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>5</span>
                                                        <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-white)' }}>Chapter 5. ExitWise 결정론 검증 감사보고서 (Verification Audit)</h3>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                                                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: isDark ? 'rgba(239,68,68,0.2)' : '#fee2e2', color: isDark ? '#ef4444' : '#b91c1c', fontWeight: 'bold' }}>오류 0</span>
                                                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: isDark ? 'rgba(245,158,11,0.2)' : '#fef3c7', color: isDark ? '#f59e0b' : '#b45309', fontWeight: 'bold' }}>주의 2</span>
                                                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: isDark ? 'rgba(16,185,129,0.2)' : '#dcfce7', color: isDark ? '#10b981' : '#15803d', fontWeight: 'bold' }}>확인 4</span>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div style={{
                                                        background: isDark ? 'rgba(16,185,129,0.06)' : '#f0fdf4',
                                                        border: isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid #bbf7d0',
                                                        padding: '14px 18px',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                                                        <div style={{ fontSize: '0.9rem', color: isDark ? '#e2e8f0' : '#14532d' }}>
                                                            <strong>[소유권 확인 완료]</strong> 소유권 단독 명의 및 매각 동의 의향서(LOI) 징구 완료.
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        background: isDark ? 'rgba(16,185,129,0.06)' : '#f0fdf4',
                                                        border: isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid #bbf7d0',
                                                        padding: '14px 18px',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
                                                        <div style={{ fontSize: '0.9rem', color: isDark ? '#e2e8f0' : '#14532d' }}>
                                                            <strong>[공적장부 면적 일치]</strong> 등기부등본 및 건축물대장상 대지면적(4,158.4㎡) 및 연면적(36,837.2㎡) 불일치 없음.
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        background: isDark ? 'rgba(245,158,11,0.06)' : '#fffbeb',
                                                        border: isDark ? '1px solid rgba(245,158,11,0.25)' : '1px solid #fde68a',
                                                        padding: '14px 18px',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <i className="fas fa-exclamation-circle" style={{ color: '#d97706' }}></i>
                                                        <div style={{ fontSize: '0.9rem', color: isDark ? '#e2e8f0' : '#78350f' }}>
                                                            <strong>[주의 - 권리관계]</strong> 근저당권 말소 조건부 매매계약 체결 요망 (매매잔금 시 기존 담보대출 동시 상환 프로세스 적용).
                                                        </div>
                                                    </div>

                                                    <div style={{
                                                        background: isDark ? 'rgba(245,158,11,0.06)' : '#fffbeb',
                                                        border: isDark ? '1px solid rgba(245,158,11,0.25)' : '1px solid #fde68a',
                                                        padding: '14px 18px',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <i className="fas fa-exclamation-circle" style={{ color: '#d97706' }}></i>
                                                        <div style={{ fontSize: '0.9rem', color: isDark ? '#e2e8f0' : '#78350f' }}>
                                                            <strong>[주의 - 운영승계]</strong> 신세계조선호텔 위탁운영 계약 승계 여부 및 브랜드 유지 조건은 매수자 희망 구조에 따라 협의 진행 필요.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chapter 6: Legal Risk Warning (첨부 사진 내용과 100% 동일) */}
                                            <div style={{
                                                background: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2',
                                                border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fca5a5',
                                                borderRadius: '12px',
                                                padding: '25px',
                                                boxShadow: isDark ? '0 4px 20px rgba(239, 68, 68, 0.1)' : '0 4px 15px rgba(239, 68, 68, 0.06)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isDark ? '#f87171' : '#b91c1c', fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '12px' }}>
                                                    <i className="fas fa-exclamation-triangle"></i> Chapter 6. 법적 투자 위험 경고 (Investment Risk Warning)
                                                </div>
                                                    <p style={{ fontSize: '0.9rem', color: isDark ? '#cbd5e1' : '#334155', lineHeight: '1.8', margin: 0 }}>
                                                        {listing.exitwiseData?.riskWarning ||
                                                            `본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 호텔 및 실물자산 투자에는 운영 리스크 및 원금 손실 리스크가 수반되며, 최종 투자 결정은 투자자 본인의 책임 하에 이루어져야 합니다. 본 문서는 투자·법률·세무 자문이 아닌 의사결정 보조 자료이며, 매각·인수 검토 전 반드시 매도인 측 실사 자료 확보 및 전문 감정평가를 진행하시기 바랍니다.`}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                            {/* Bottom Full Report Action Card */}
                                            <div style={{
                                                background: isDark
                                                    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))'
                                                    : 'linear-gradient(135deg, #f8fafc, #ffffff)',
                                                padding: '25px 30px',
                                                borderRadius: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                border: isDark ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid rgba(0,0,0,0.1)',
                                                flexWrap: 'wrap',
                                                gap: '20px',
                                                boxShadow: isDark ? 'none' : '0 6px 20px rgba(0,0,0,0.05)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: isDark ? 'rgba(14,165,233,0.15)' : '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '1.6rem' }}>
                                                        <i className="fas fa-file-pdf"></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', color: 'var(--text-white)', fontSize: '1.1rem' }}>{listing.title} - ExitWise 풀버전 IM 리포트.pdf</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '3px' }}>
                                                            문서 ID: {listing.exitwiseData?.imDocumentId || 'cda6733f-78b1-4a42-b7ae-3a9b1c1bc606'} • 48페이지 완성본 • 암호화 보안 적용
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={openRawImWindow}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '12px 20px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        <i className="fas fa-file-alt"></i> 채팅창 IM 원문 별도창 열기
                                                    </button>
                                                    <button
                                                        onClick={() => setIsDeckModalOpen(true)}
                                                        className="btn-primary"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', fontSize: '0.95rem' }}
                                                    >
                                                        <i className="fas fa-eye"></i> 전체화면 뷰어로 읽기
                                                    </button>
                                                    <button
                                                        onClick={() => alert(`[ExitWise IM 전문 다운로드 신청]\n${listing.title}의 정식 풀버전 IM(48P) 및 실사 데이터룸(VDR) 접근 권한 신청이 접수되었습니다. 가자에셋 전담 어드바이저가 승인 절차를 진행합니다.`)}
                                                        style={{
                                                            background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                                            color: 'var(--text-white)',
                                                            border: `1px solid ${cardBorder}`,
                                                            borderRadius: '8px',
                                                            padding: '12px 20px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        <i className="fas fa-download"></i> 원본 PDF 다운로드
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    )}

                                    {/* Tab 3: Yield Calculator & Wealth Simulator */}
                                    {activeTab === 'analysis' && (
                                        <div>
                                            <YieldCalculator
                                                appraisalPrice={parseKoreanCurrency(listing.salePrice || listing.minPrice || listing.appraisal)}
                                                minPrice={parseKoreanCurrency(listing.minPrice || listing.salePrice)}
                                            />

                                            <WealthSimulator
                                                initialInvestment={parseKoreanCurrency(listing.salePrice || listing.minPrice)}
                                                growthRate={listing.roi ? parseFloat(listing.roi) : 6.5}
                                            />
                                        </div>
                                    )}

                                    {/* Tab 4: Location */}
                                    {activeTab === 'location' && (
                                        <div className="glass-card" style={{ padding: '40px', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <i className="fas fa-map-marked-alt" style={{ fontSize: '3.5rem', color: 'var(--accent-gold)', marginBottom: '20px' }}></i>
                                                <h3 style={{ color: 'var(--text-white)', marginBottom: '10px' }}>{listing.location}</h3>
                                                <p style={{ color: 'var(--text-off-white)', lineHeight: '1.7' }}>
                                                    상세 주소 및 정밀 지적도는 보안상<br />
                                                    <strong style={{ color: 'var(--accent-gold)' }}>가자에셋 자산 실사(DD) 신청 고객</strong>에게만 제공됩니다.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right: Sticky Action Sidebar */}
                        <div style={{ flex: 1, minWidth: '300px', position: 'sticky', top: '100px' }}>
                            <div className="glass-card" style={{
                                padding: '30px',
                                border: '2px solid var(--accent-gold)',
                                borderRadius: '16px',
                                background: cardBg,
                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(184, 134, 11, 0.08)'
                            }}>
                                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--text-white)', fontWeight: '800' }}>
                                    자산 매수 및 실사 문의
                                </h3>
                                <p style={{ color: 'var(--text-gray)', marginBottom: '25px', fontSize: '0.92rem' }}>
                                    가자에셋 수석 컨설턴트가 전담 실사 리포트를 제공해 드립니다.
                                </p>

                                <ul style={{ marginBottom: '30px', fontSize: '0.9rem', color: 'var(--text-off-white)', listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                        <i className="fas fa-check-circle" style={{ color: 'var(--accent-gold)', marginRight: '10px', fontSize: '1rem' }}></i>
                                        법률/권리/세무 정밀 실사(Due Diligence)
                                    </li>
                                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                        <i className="fas fa-check-circle" style={{ color: 'var(--accent-gold)', marginRight: '10px', fontSize: '1rem' }}></i>
                                        {listing.category === '호텔' ? '호텔 OCC/ADR 운영 수익률표' : '임대료 수익률 및 현금흐름표'}
                                    </li>
                                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                        <i className="fas fa-check-circle" style={{ color: 'var(--accent-gold)', marginRight: '10px', fontSize: '1rem' }}></i>
                                        매수 희망가 산정 및 입찰 가이드
                                    </li>
                                </ul>

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', borderRadius: '8px', padding: '14px', fontSize: '1.05rem', fontWeight: 'bold' }}
                                    onClick={openConsulting}
                                >
                                    VIP 자산 상담 신청하기
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: 'var(--text-gray)' }}>
                                    <i className="fas fa-phone-alt" style={{ marginRight: '6px', color: 'var(--accent-gold)' }}></i> 02-1234-5678
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Fullscreen Interactive IM Presentation Deck Modal */}
            <AnimatePresence>
                {isDeckModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: isDark ? 'rgba(5, 10, 20, 0.88)' : 'rgba(15, 23, 42, 0.65)',
                            backdropFilter: 'blur(16px)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                    >
                        {/* Modal Dialog Card */}
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                width: '100%',
                                maxWidth: '1100px',
                                height: '88vh',
                                background: isDark ? '#0b1329' : '#ffffff',
                                border: isDark ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid #cbd5e1',
                                borderRadius: '18px',
                                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {/* Modal Header Toolbar */}
                            <div style={{
                                padding: '16px 24px',
                                background: isDark ? 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)' : '#f8fafc',
                                borderBottom: `1px solid ${subCardBorder}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        ExitWise IM Deck
                                    </span>
                                    <strong style={{ color: 'var(--text-white)', fontSize: '1.05rem' }}>
                                        {listing.title} • 공식 투자설명서 Deck
                                    </strong>
                                </div>

                                {/* Slide Tabs / Breadcrumbs */}
                                <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '4px 0' }}>
                                    {[
                                        { num: 1, label: '커버' },
                                        { num: 2, label: '개요 & 스펙' },
                                        { num: 3, label: '실적 & 재무' },
                                        { num: 4, label: '투자 하이라이트' },
                                        { num: 5, label: '층별 시설' },
                                        { num: 6, label: '검증 & 고지' }
                                    ].map(tab => (
                                        <button
                                            key={tab.num}
                                            onClick={() => setDeckPage(tab.num)}
                                            style={{
                                                padding: '5px 10px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: deckPage === tab.num ? '#0ea5e9' : (isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'),
                                                color: deckPage === tab.num ? 'white' : 'var(--text-gray)',
                                                fontSize: '0.8rem',
                                                fontWeight: deckPage === tab.num ? '700' : '500',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {tab.num}. {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={handlePrint}
                                        style={{
                                            padding: '6px 12px',
                                            background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                            color: 'var(--text-white)',
                                            border: `1px solid ${subCardBorder}`,
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        <i className="fas fa-print"></i> 인쇄
                                    </button>
                                    <button
                                        onClick={() => setIsDeckModalOpen(false)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                            color: 'var(--text-white)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.1rem'
                                        }}
                                        title="닫기 (Esc)"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content Deck Slide Area */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '35px 40px', color: 'var(--text-off-white)' }}>
                                {/* Slide 1: Cover */}
                                {deckPage === 1 && (
                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2', border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #f87171', color: isDark ? '#f87171' : '#b91c1c', fontSize: '0.82rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '25px' }}>
                                            STRICTLY CONFIDENTIAL • INVESTMENT MEMORANDUM
                                        </div>
                                        <h1 style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--text-white)', marginBottom: '16px', lineHeight: '1.3' }}>
                                            {listing.exitwiseData?.imTitle || '해운대 그랜드조선 부산 관광호텔 자산 매각 IM'}
                                        </h1>
                                        <p style={{ fontSize: '1.2rem', color: 'var(--text-gray)', maxWidth: '700px', margin: '0 auto 35px', lineHeight: '1.7' }}>
                                            대한민국 1순위 해양 리조트 해운대 1선 오션프론트 5성급 럭셔리 관광호텔 자산 인수 및 밸류애드 투자설명서
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '45px' }}>
                                            <div style={{ background: subCardBg, padding: '16px 28px', borderRadius: '10px', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>희망 매각가</div>
                                                <div style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', fontWeight: 'bold' }}>{listing.salePrice || '1,850억원'}</div>
                                            </div>
                                            <div style={{ background: subCardBg, padding: '16px 28px', borderRadius: '10px', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>목표 수익률 (Cap Rate)</div>
                                                <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>5.8% (정상화 6.3%)</div>
                                            </div>
                                            <div style={{ background: subCardBg, padding: '16px 28px', borderRadius: '10px', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>객실 점유율 (OCC)</div>
                                                <div style={{ color: '#0284c7', fontSize: '1.5rem', fontWeight: 'bold' }}>78.4%</div>
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>
                                            문서 식별 번호: {listing.exitwiseData?.imDocNumber || 'IM-2026-EW-BUSAN-09'} • 발행: ExitWise AI × GAJA ASSET (2026.09)
                                        </div>
                                    </div>
                                )}

                                {/* Slide 2: Executive Summary & Specs */}
                                {deckPage === 2 && (
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-white)', marginBottom: '8px' }}>자산 개요 및 물리적 제원 (Property Specs)</h3>
                                        <p style={{ color: 'var(--text-gray)', marginBottom: '25px', fontSize: '0.95rem' }}>해운대 특급호텔 중심부 입지 및 2020년 전면 올리노베이션을 완료한 초특급 시설</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '25px' }}>
                                            <div style={{ background: subCardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>자산명 / 등급</div>
                                                <strong style={{ color: 'var(--text-white)', fontSize: '1.15rem' }}>{listing.exitwiseData?.assetName} (5성급)</strong>
                                            </div>
                                            <div style={{ background: subCardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>총 객실 수</div>
                                                <strong style={{ color: 'var(--text-white)', fontSize: '1.15rem' }}>{listing.exitwiseData?.rooms} (전 객실 오션/시티뷰)</strong>
                                            </div>
                                            <div style={{ background: subCardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>대지면적 / 연면적</div>
                                                <strong style={{ color: 'var(--text-white)', fontSize: '1.05rem' }}>{listing.exitwiseData?.landArea} / {listing.exitwiseData?.totalFloorArea}</strong>
                                            </div>
                                            <div style={{ background: subCardBg, padding: '20px', borderRadius: '10px', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>건축 규모 / 주차</div>
                                                <strong style={{ color: 'var(--text-white)', fontSize: '1.05rem' }}>{listing.exitwiseData?.floors} / {listing.exitwiseData?.parking}</strong>
                                            </div>
                                        </div>

                                        <div style={{
                                            background: isDark ? 'rgba(14, 165, 233, 0.05)' : '#f0f9ff',
                                            borderLeft: '4px solid #0284c7',
                                            padding: '18px 22px',
                                            borderRadius: '0 8px 8px 0',
                                            lineHeight: '1.7',
                                            color: 'var(--text-off-white)'
                                        }}>
                                            {listing.exitwiseData?.executiveSummary}
                                        </div>
                                    </div>
                                )}

                                {/* Slide 3: Metrics & Financials */}
                                {deckPage === 3 && (
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-white)', marginBottom: '8px' }}>핵심 운영 지표 & 4개년 재무 실적</h3>
                                        <p style={{ color: 'var(--text-gray)', marginBottom: '22px', fontSize: '0.95rem' }}>OCC 78.4%, 연간 매출 485.6억, EBITDA 107.3억원 기반의 강력한 현금흐름</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '25px' }}>
                                            <div style={{ background: subCardBg, padding: '16px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>객실점유율(OCC)</div>
                                                <div style={{ color: '#0284c7', fontSize: '1.6rem', fontWeight: 'bold', marginTop: '4px' }}>78.4%</div>
                                            </div>
                                            <div style={{ background: subCardBg, padding: '16px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>평균객실단가(ADR)</div>
                                                <div style={{ color: 'var(--accent-gold)', fontSize: '1.6rem', fontWeight: 'bold', marginTop: '4px' }}>285,000원</div>
                                            </div>
                                            <div style={{ background: subCardBg, padding: '16px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>가용객실매출(RevPAR)</div>
                                                <div style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: 'bold', marginTop: '4px' }}>223,440원</div>
                                            </div>
                                            <div style={{ background: subCardBg, padding: '16px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${subCardBorder}` }}>
                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>EBITDA (마진율)</div>
                                                <div style={{ color: '#9333ea', fontSize: '1.6rem', fontWeight: 'bold', marginTop: '4px' }}>107.3억 (22.1%)</div>
                                            </div>
                                        </div>

                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: 'var(--text-gray)' }}>
                                                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>구분 (단위: 억원)</th>
                                                    <th style={{ padding: '10px 14px' }}>2023년</th>
                                                    <th style={{ padding: '10px 14px' }}>2024년</th>
                                                    <th style={{ padding: '10px 14px', color: 'var(--accent-gold)' }}>2025년 (최신)</th>
                                                    <th style={{ padding: '10px 14px', color: '#0284c7' }}>2026년 (추정)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: `1px solid ${subCardBorder}`, fontWeight: 'bold', color: 'var(--text-white)' }}>
                                                    <td style={{ textAlign: 'left', padding: '10px 14px' }}>총 매출액</td>
                                                    <td style={{ padding: '10px 14px', color: 'var(--text-off-white)' }}>412.5억</td>
                                                    <td style={{ padding: '10px 14px', color: 'var(--text-off-white)' }}>451.8억</td>
                                                    <td style={{ padding: '10px 14px', color: 'var(--accent-gold)' }}>485.6억</td>
                                                    <td style={{ padding: '10px 14px', color: '#0284c7' }}>520.0억</td>
                                                </tr>
                                                <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                    <td style={{ textAlign: 'left', padding: '8px 14px' }}>- 객실 매출</td>
                                                    <td style={{ padding: '8px 14px' }}>235.0억</td>
                                                    <td style={{ padding: '8px 14px' }}>258.4억</td>
                                                    <td style={{ padding: '8px 14px' }}>280.1억</td>
                                                    <td style={{ padding: '8px 14px' }}>305.0억</td>
                                                </tr>
                                                <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                    <td style={{ textAlign: 'left', padding: '8px 14px' }}>- 식음료 (F&B)</td>
                                                    <td style={{ padding: '8px 14px' }}>142.5억</td>
                                                    <td style={{ padding: '8px 14px' }}>156.2억</td>
                                                    <td style={{ padding: '8px 14px' }}>165.0억</td>
                                                    <td style={{ padding: '8px 14px' }}>172.0억</td>
                                                </tr>
                                                <tr style={{ background: isDark ? 'rgba(14, 165, 233, 0.08)' : '#f0f9ff', fontWeight: 'bold', color: '#0284c7' }}>
                                                    <td style={{ textAlign: 'left', padding: '10px 14px' }}>EBITDA (현금흐름)</td>
                                                    <td style={{ padding: '10px 14px', color: 'var(--text-off-white)' }}>82.4억</td>
                                                    <td style={{ padding: '10px 14px', color: 'var(--text-off-white)' }}>96.5억</td>
                                                    <td style={{ padding: '10px 14px', color: 'var(--accent-gold)' }}>107.3억</td>
                                                    <td style={{ padding: '10px 14px', color: '#10b981' }}>119.6억</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Slide 4: Highlights */}
                                {deckPage === 4 && (
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-white)', marginBottom: '8px' }}>4대 핵심 투자 하이라이트 (Investment Thesis)</h3>
                                        <p style={{ color: 'var(--text-gray)', marginBottom: '25px', fontSize: '0.95rem' }}>자산 가치 상승과 안정적 배당 수익률을 동시에 추구하는 핵심 매력도</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                            {(listing.exitwiseData?.highlights || []).map((hl, i) => (
                                                <div key={i} style={{ background: subCardBg, padding: '22px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{i + 1}</span>
                                                        <strong style={{ color: 'var(--text-white)', fontSize: '1.02rem' }}>{hl.title}</strong>
                                                    </div>
                                                    <p style={{ color: 'var(--text-gray)', fontSize: '0.88rem', margin: 0, lineHeight: '1.65' }}>{hl.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Slide 5: Floor Plan */}
                                {deckPage === 5 && (
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-white)', marginBottom: '8px' }}>층별 공간 계획 및 부대시설 현황 (Floor Program)</h3>
                                        <p style={{ color: 'var(--text-gray)', marginBottom: '20px', fontSize: '0.95rem' }}>16F 루프탑 인피니티풀부터 지하 6층 240대 주차 공간까지 최적화된 동선 설계</p>

                                        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                <thead>
                                                    <tr style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: 'var(--text-gray)' }}>
                                                        <th style={{ width: '15%', padding: '10px 14px', textAlign: 'left' }}>층수</th>
                                                        <th style={{ width: '55%', padding: '10px 14px', textAlign: 'left' }}>용도 및 주요 시설</th>
                                                        <th style={{ width: '30%', padding: '10px 14px', textAlign: 'left' }}>비고</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(listing.exitwiseData?.floorPlan || []).map((item, idx) => (
                                                        <tr key={idx} style={{ borderBottom: `1px solid ${subCardBorder}` }}>
                                                            <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#0284c7' }}>{item.floor}</td>
                                                            <td style={{ padding: '10px 14px', color: 'var(--text-white)' }}>{item.use}</td>
                                                            <td style={{ padding: '10px 14px', color: 'var(--text-gray)' }}>{item.note}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Slide 6: Verification & Risk */}
                                {deckPage === 6 && (
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-white)', marginBottom: '8px' }}>결정론 검증 결과 & 법적 위험고지</h3>
                                        <p style={{ color: 'var(--text-gray)', marginBottom: '20px', fontSize: '0.95rem' }}>ExitWise AI 엔진의 공적장부 교차검증 및 투자 유의사항</p>

                                        <div style={{
                                            background: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
                                            border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0',
                                            padding: '16px 20px',
                                            borderRadius: '10px',
                                            marginBottom: '20px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <strong style={{ color: '#16a34a' }}><i className="fas fa-shield-alt"></i> ExitWise Determinism Engine: 오류 0건 (정합성 100%)</strong>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>토지/건축물대장/등기부 3대 공적장부 일치</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#e2e8f0' : '#14532d' }}>
                                                등기부 권리관계, 건축물대장 용도 및 연면적, 토지이용계획원 대조 결과 법적 결격사유가 없는 안전한 자산으로 검증되었습니다.
                                            </p>
                                        </div>

                                        <div style={{
                                            background: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2',
                                            border: isDark ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #fca5a5',
                                            padding: '20px',
                                            borderRadius: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isDark ? '#f87171' : '#b91c1c', fontWeight: 'bold', marginBottom: '8px' }}>
                                                <i className="fas fa-exclamation-triangle"></i> 법적 투자 위험 경고 (Investment Risk Warning)
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#334155', lineHeight: '1.7' }}>
                                                {listing.exitwiseData?.riskWarning}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer Slide Controls */}
                            <div style={{
                                padding: '16px 24px',
                                background: isDark ? '#0a1022' : '#f8fafc',
                                borderTop: `1px solid ${subCardBorder}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <button
                                    onClick={() => setDeckPage(prev => Math.max(prev - 1, 1))}
                                    disabled={deckPage === 1}
                                    style={{
                                        padding: '8px 18px',
                                        background: deckPage === 1 ? (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9') : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                                        color: deckPage === 1 ? '#94a3b8' : 'var(--text-white)',
                                        border: `1px solid ${subCardBorder}`,
                                        borderRadius: '6px',
                                        cursor: deckPage === 1 ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <i className="fas fa-chevron-left"></i> 이전 슬라이드
                                </button>

                                <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    Slide <span style={{ color: '#0ea5e9' }}>{deckPage}</span> / 6
                                </div>

                                <button
                                    onClick={() => setDeckPage(prev => Math.min(prev + 1, 6))}
                                    disabled={deckPage === 6}
                                    style={{
                                        padding: '8px 18px',
                                        background: deckPage === 6 ? (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9') : '#0ea5e9',
                                        color: deckPage === 6 ? '#94a3b8' : 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: deckPage === 6 ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    다음 슬라이드 <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

const InfoItem = ({ label, value, highlight, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '14px',
            color: 'var(--accent-gold)',
            fontSize: '1.1rem'
        }}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: highlight ? 'var(--accent-gold)' : 'var(--text-white)' }}>{value || '-'}</div>
        </div>
    </div>
);

export default ListingDetailPage;
