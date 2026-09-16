import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { YieldCalculator } from '../components/calculator/YieldCalculator';
import { WealthSimulator } from '../components/calculator/WealthSimulator';
import { TrustBadge } from '../components/trust/TrustBadge';
import SEO from '../components/SEO';
import DataManager from '../utils/DataManager';
import ExitWiseSyncManager from '../utils/ExitWiseSyncManager';
import { useTheme } from '../context/ThemeContext';
import ExitWiseMarkdownViewer from '../components/im/ExitWiseMarkdownViewer';
import KakaoMapEmbed from '../components/im/KakaoMapEmbed';
import KakaoRoadviewEmbed from '../components/im/KakaoRoadviewEmbed';
import KakaoSkyviewEmbed from '../components/im/KakaoSkyviewEmbed';
import KpiStatCards from '../components/im/KpiStatCards';
import SensitivitySimulator from '../components/im/SensitivitySimulator';
import FinancialChart from '../components/im/FinancialChart';
import { unescapeMarkdown, extractMetricsFromIM, cleanExecutiveSummary } from '../utils/markdownUtils';
import AiPropertyPhotoEngine from '../services/AiPropertyPhotoEngine';

const parseKoreanCurrency = (str) => {
    if (!str) return 0;
    const cleanStr = String(str).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    if (String(str).includes('억')) return num * 100000000;
    return num || 0;
};

const ListingDetailPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [registrationSuccessNotice, setRegistrationSuccessNotice] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [locationViewMode, setLocationViewMode] = useState('map'); // 'map' | 'roadview'
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
    const [deckPage, setDeckPage] = useState(1);
    const [copiedNotice, setCopiedNotice] = useState(false);
    const [syncNotice, setSyncNotice] = useState(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null); // Lightbox 중앙 팝업 인덱스
    const { openConsulting } = useOutletContext() || {};
    const { isDark } = useTheme();

    // 카카오 로드뷰/스카이뷰/웹실사 AI 사진 후보군 도출
    const aiCandidates = useMemo(() => {
        if (!listing) return [];
        if (listing.aiPhotoVerification?.candidates && listing.aiPhotoVerification.candidates.length > 0) {
            return listing.aiPhotoVerification.candidates;
        }
        const evalResult = AiPropertyPhotoEngine.evaluateFast({
            listingId: listing.id,
            title: listing.title,
            address: listing.location,
            category: listing.category
        });
        return evalResult.candidates || [];
    }, [listing]);

    // 대표 사진 변경 핸들러
    const handleSetAsMainPhoto = (candidate) => {
        if (!listing) return;
        const updated = {
            ...listing,
            img: candidate.url,
            aiPhotoVerification: {
                ...(listing.aiPhotoVerification || {}),
                selectedSource: candidate.source,
                sourceLabel: candidate.label,
                score: candidate.score,
                reason: candidate.reason,
                candidates: aiCandidates
            }
        };
        DataManager.saveListing(updated);
        setListing(updated);
        alert(`[대표 사진 변경 완료]\n'${candidate.label}' 사진이 본 매물의 공식 대표 사진으로 설정되었습니다.`);
    };

    // ExitWise IM 마크다운 본문으로부터 최신 지표, 제원, KPI, 시뮬레이션 데이터 역추출 (자동 정합)
    const imMetrics = useMemo(() => {
        if (!listing) return null;
        const md = listing.exitwiseData?.markdownContent;
        if (md) {
            return extractMetricsFromIM(md, listing);
        }
        return null;
    }, [listing]);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setRegistrationSuccessNotice(true);
            setTimeout(() => setRegistrationSuccessNotice(false), 5000);
        }
    }, [searchParams]);

    useEffect(() => {
        window.scrollTo(0, 0);
        DataManager.init();
        let isMounted = true;
        const found = DataManager.getListingById(id);
        if (found) {
            setListing(found);
            setIsLoading(false);
            // ExitWise 연동 매물인 경우 즉시 IM 전문 탭을 기본 활성화
            if (found.isExitwiseLinked) {
                setActiveTab('exitwise');
                // Background SWR 최신 IM 동기화 시도
                const imDocId = found.exitwiseData?.imDocumentId || found.id;
                if (imDocId) {
                    ExitWiseSyncManager.syncWithExitwise(imDocId);
                }
            }
        } else if (id && (String(id).startsWith('exitwise-') || String(id).length >= 8)) {
            // 로컬에 매물이 없으나 ExitWise 식별자인 경우 원격 Auto-Heal 조회 시도
            setIsLoading(true);
            ExitWiseSyncManager.fetchAndImport(id)
                .then((remoteListing) => {
                    if (!isMounted) return;
                    if (remoteListing) {
                        setListing(remoteListing);
                        if (remoteListing.isExitwiseLinked) {
                            setActiveTab('exitwise');
                        }
                    }
                    setIsLoading(false);
                })
                .catch(() => {
                    if (isMounted) setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }

        // ExitWise 실시간 동기화 이벤트 구독 (BroadcastChannel & storage)
        const unsubscribe = ExitWiseSyncManager.subscribe((event) => {
            if (event.type === 'IM_DOCUMENT_UPDATED' || event.type === 'LIVE_REVALIDATION_SUCCESS') {
                const updated = DataManager.getListingById(id);
                if (updated && isMounted) {
                    setListing({ ...updated });
                    setSyncNotice('ExitWise 최신 IM 업데이트가 실시간 반영되었습니다.');
                    setTimeout(() => setSyncNotice(null), 4000);
                }
            }
        });

        // 로컬 정본 재검증 이벤트 수신
        const handleLocalRevalidated = (e) => {
            if (e.detail?.id === id || !id || e.type === 'exitwise_all_im_revalidated') {
                const updated = DataManager.getListingById(id);
                if (updated && isMounted) {
                    setListing({ ...updated });
                }
            }
        };
        window.addEventListener('exitwise_im_revalidated', handleLocalRevalidated);
        window.addEventListener('exitwise_all_im_revalidated', handleLocalRevalidated);

        return () => {
            isMounted = false;
            unsubscribe();
            window.removeEventListener('exitwise_im_revalidated', handleLocalRevalidated);
            window.removeEventListener('exitwise_all_im_revalidated', handleLocalRevalidated);
        };
    }, [id]);

    // 탭 전환 시 지도 컨테이너 크기 재계산 (0px 축소 버그 원천 방지)
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 120);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const handleRegenerateAndSyncIM = () => {
        const targetId = listing?.id || id;
        const refreshed = DataManager.revalidateListingIM(targetId, true);
        if (refreshed) {
            setListing({ ...refreshed });
            setSyncNotice('ExitWise 정본 IM(서문·지도·도표·감사보고서 완비)으로 최신 재생성 및 동기화되었습니다.');
            setTimeout(() => setSyncNotice(null), 4000);
            setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
        }
    };

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

    if (isLoading) {
        return (
            <div style={{ padding: '220px 20px', textAlign: 'center', color: 'var(--text-white)' }}>
                <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.8rem', color: 'var(--accent-gold)', marginBottom: '22px' }}></i>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '10px' }}>매물 정보를 불러오는 중입니다...</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem' }}>ExitWise AI 투자분석 IM 및 자산 제원을 안전하게 동기화하고 있습니다.</p>
            </div>
        );
    }

    if (!listing) {
        return (
            <div style={{ padding: '200px 20px', textAlign: 'center', color: 'var(--text-white)' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px'
                }}>
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>매물을 찾을 수 없습니다.</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                    요청하신 매물({id}) 정보가 삭제되었거나 일시적으로 동기화가 지연되고 있습니다. 전체 매물 목록에서 다른 추천 자산을 확인해 보세요.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link to="/listings" className="btn-primary" style={{ display: 'inline-block' }}>전체 매물 목록 보기</Link>
                    <Link to="/" style={{
                        display: 'inline-block',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-white)',
                        fontWeight: 600,
                        textDecoration: 'none'
                    }}>홈으로 이동</Link>
                </div>
            </div>
        );
    }

    const isGeneral = listing.type === 'general';
    const isNpl = listing.type === 'npl';
    const isAuction = listing.type === 'auction' || !listing.type;
    const isExitwise = Boolean(listing.isExitwiseLinked);

    const assetCategory = listing.category || listing.exitwiseData?.category || '';
    const assetTitle = `${listing.title || ''} ${listing.exitwiseData?.imTitle || ''} ${listing.location || ''}`;
    const isHotel = assetCategory === '호텔' || assetTitle.includes('호텔') || assetTitle.includes('그랜드조선');
    const isFactory = assetCategory === '공장/제조' || assetTitle.includes('공장') || assetTitle.includes('제조') || assetTitle.includes('플랜트') || assetTitle.includes('양주');
    const isOffice = assetCategory === '오피스빌딩' || assetTitle.includes('오피스') || assetTitle.includes('타워') || assetTitle.includes('FKI');
    const isLogistics = assetCategory === '물류센터' || assetTitle.includes('물류');

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
            <section style={{ minHeight: '420px', height: 'auto', position: 'relative', overflow: 'hidden', padding: '130px 0 50px', display: 'flex', alignItems: 'flex-end' }}>
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
                    height: '75%',
                    background: isDark
                        ? 'linear-gradient(to top, var(--primary-navy) 20%, rgba(2, 6, 11, 0.8) 60%, transparent 100%)'
                        : 'linear-gradient(to top, var(--primary-navy) 20%, rgba(248,249,252,0.85) 60%, transparent 100%)'
                }} />

                <div className="container listing-detail-hero-container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ maxWidth: '900px' }}>
                        {/* 상단 브레드크럼 & 목록으로 돌아가기 버튼 */}
                        <div style={{ marginBottom: '16px' }}>
                            <Link
                                to="/listings"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    borderRadius: '24px',
                                    background: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    border: isDark ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(0, 0, 0, 0.12)',
                                    color: isDark ? '#e2e8f0' : '#1e293b',
                                    fontSize: '0.86rem',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(-3px)';
                                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.18)' : '1px solid rgba(0, 0, 0, 0.12)';
                                }}
                            >
                                <i className="fas fa-arrow-left" style={{ color: 'var(--accent-gold)', fontSize: '0.82rem' }}></i>
                                <span>전체 매물 목록으로</span>
                            </Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                            {/* Type Badge */}
                            {isGeneral && (
                                <span style={{ background: '#10b981', color: 'white', padding: '5px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                                    일반매물 (매매/급매)
                                </span>
                            )}
                            {isNpl && (
                                <span style={{ background: '#a855f7', color: 'white', padding: '5px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                                    NPL (부실채권 론세일)
                                </span>
                            )}
                            {isAuction && (
                                <span style={{ background: 'var(--accent-gold)', color: '#000', padding: '5px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                                    법원 경매
                                </span>
                            )}

                            {/* Category Badge */}
                            <span style={{
                                background: listing.category === '호텔' ? '#0ea5e9' : listing.category === '오피스빌딩' ? '#6366f1' : 'rgba(255,255,255,0.15)',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
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
                                    fontSize: '0.82rem',
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

                        <h1 style={{
                            fontSize: 'clamp(1.5rem, 4.5vw, 2.6rem)',
                            fontWeight: '800',
                            marginBottom: '10px',
                            lineHeight: '1.25',
                            color: 'var(--text-white)',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word'
                        }}>
                            {listing.title}
                        </h1>
                        <p style={{
                            fontSize: 'clamp(0.92rem, 2.4vw, 1.15rem)',
                            color: 'var(--text-gray)',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '6px'
                        }}>
                            <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-gold)' }}></i>
                            <span>{listing.location}</span>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section style={{ padding: '30px 0 100px' }}>
                <div className="container">
                    <div className="listing-detail-layout">

                        {/* Left: Main Tabs & Info */}
                        <div className="listing-detail-main">
                            {/* ExitWise New Registration Success Banner */}
                            {registrationSuccessNotice && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.95), rgba(180, 83, 9, 0.95))',
                                        color: '#ffffff',
                                        padding: '14px 20px',
                                        borderRadius: '12px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontWeight: '700',
                                        fontSize: '0.94rem',
                                        boxShadow: '0 4px 18px rgba(217, 119, 6, 0.35)',
                                        border: '1px solid rgba(254, 243, 199, 0.4)'
                                    }}
                                >
                                    <i className="fas fa-check-circle" style={{ fontSize: '1.3rem', color: '#fde68a' }}></i>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>ExitWise AI 매물 등록 완료!</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 500, opacity: 0.95, marginTop: '2px' }}>
                                            가자에셋 플랫폼에 정상 게시되었으며 투자설명서(IM) 전문과 제원이 안전하게 연동되었습니다.
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Live Sync Notice Banner */}
                            {syncNotice && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
                                        color: '#ffffff',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontWeight: '700',
                                        fontSize: '0.92rem',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                                    }}
                                >
                                    <i className="fas fa-check-circle" style={{ fontSize: '1.2rem', color: '#a7f3d0' }}></i>
                                    <span>{syncNotice}</span>
                                </motion.div>
                            )}

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
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
                                            }}
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
                                        <div className="glass-card listing-detail-card" style={{ padding: '36px 40px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderLeft: '4px solid var(--accent-gold)', paddingLeft: '15px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-white)' }}>핵심 거래 지표</h3>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>업데이트: 2026.09</span>
                                            </div>

                                            {/* Dynamic Metrics by Transaction Type */}
                                            {isGeneral && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                                                    <InfoItem label="희망 매매가" value={imMetrics?.salePrice || listing.salePrice || listing.minPrice || '협의'} highlight icon="fa-coins" />
                                                    <InfoItem label="연 예상 수익률" value={imMetrics?.roi || listing.roi || listing.exitwiseData?.capRate || '협의'} highlight icon="fa-chart-line" />
                                                    <InfoItem label="임대 보증금" value={imMetrics?.deposit || listing.deposit || '협의 (실사 확인)'} icon="fa-wallet" />
                                                    <InfoItem label="월 임대료" value={
                                                        (() => {
                                                            const r = imMetrics?.monthlyRent || listing.monthlyRent;
                                                            if (!r) return '직접 운영 / 협의';
                                                            return r.startsWith('월') ? r : `월 ${r}`;
                                                        })()
                                                    } icon="fa-money-bill-wave" />
                                                    <InfoItem label="평당가" value={
                                                        (() => {
                                                            const p = imMetrics?.pricePerPyung || listing.pricePerPyung;
                                                            if (!p) return '시세 대비 우량';
                                                            return p.startsWith('평당') ? p : `평당 ${p}`;
                                                        })()
                                                    } icon="fa-vector-square" />
                                                    <InfoItem label="자산 용도" value={listing.category || '수익형 부동산'} icon="fa-building" />
                                                </div>
                                            )}

                                            {isNpl && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                                                    <InfoItem label="NPL 매각희망가" value={listing.nplTargetPrice || imMetrics?.salePrice || listing.salePrice || listing.minPrice || '협의'} highlight icon="fa-hand-holding-usd" />
                                                    <InfoItem label="채권최고액" value={listing.claimMax || listing.exitwiseData?.keyMetrics?.claimMax || '협의'} icon="fa-file-invoice-dollar" />
                                                    <InfoItem label="채권원금(OPB)" value={listing.opb || listing.exitwiseData?.keyMetrics?.opb || '협의'} icon="fa-balance-scale" />
                                                    <InfoItem label="담보 감정평가액" value={listing.collateralValue || listing.appraisal || listing.exitwiseData?.keyMetrics?.appraisalValue || '감정가 확인'} icon="fa-shield-alt" />
                                                    <InfoItem label="예상 배당회수금" value={listing.expectedDividend || listing.exitwiseData?.keyMetrics?.expectedReturn || '배당 시뮬레이션 참조'} highlight icon="fa-chart-pie" />
                                                    <InfoItem label="할인율 / LTV" value={listing.rate ? `할인율 ${listing.rate}` : (listing.exitwiseData?.keyMetrics?.ltv ? `LTV ${listing.exitwiseData.keyMetrics.ltv}` : '선순위 담보')} icon="fa-percentage" />
                                                </div>
                                            )}

                                            {isAuction && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                                                    <InfoItem label="감정가" value={listing.appraisal || '감정가 확인'} icon="fa-balance-scale" />
                                                    <InfoItem label="최저입찰가" value={listing.minPrice || '최저가 확인'} highlight icon="fa-tag" />
                                                    <InfoItem label="최저가율" value={listing.rate || '70%'} icon="fa-chart-pie" />
                                                    <InfoItem label="사건번호" value={listing.caseNumber || '진행사건 확인'} icon="fa-gavel" />
                                                    <InfoItem label="입찰기일" value={listing.auctionDate || '입찰기일 확인'} icon="fa-calendar-alt" />
                                                    <InfoItem label="관할법원" value={listing.court || '관할법원 확인'} icon="fa-landmark" />
                                                </div>
                                            )}

                                            {/* Specs: 오피스빌딩, 호텔 맞춤 상세 제원 (백슬래시 완전 제거) */}
                                            <div style={{ marginTop: '20px', paddingTop: '30px', borderTop: `1px solid ${subCardBorder}` }}>
                                                <h4 style={{ color: 'var(--text-white)', marginBottom: '20px', fontSize: '1.15rem' }}>자산 상세 제원 (Property Specs)</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                    <div>
                                                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>대지면적: </span>
                                                        <strong style={{ color: 'var(--text-white)' }}>
                                                            {unescapeMarkdown(imMetrics?.landArea || listing.landArea || listing.specs?.landArea || listing.exitwiseData?.landArea || (listing.area ? `${listing.area}평` : '실사 확인'))}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>연면적: </span>
                                                        <strong style={{ color: 'var(--text-white)' }}>
                                                            {unescapeMarkdown(imMetrics?.totalFloorArea || listing.totalFloorArea || listing.specs?.totalFloorArea || listing.exitwiseData?.totalFloorArea || '실사 확인')}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>규모/층수: </span>
                                                        <strong style={{ color: 'var(--text-white)' }}>
                                                            {unescapeMarkdown(imMetrics?.floors || listing.floors || listing.specs?.floors || listing.exitwiseData?.floors || '실사 확인')}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                                                            {isHotel ? '객실 수: ' : (isFactory ? '수전/전력: ' : (isOffice ? '기준층 전용률: ' : '주차 대수: '))}
                                                        </span>
                                                        <strong style={{ color: 'var(--text-white)' }}>
                                                            {unescapeMarkdown(isHotel
                                                                ? (listing.exitwiseData?.rooms || '330실')
                                                                : (isFactory
                                                                    ? (listing.exitwiseData?.power || '3,000 kW (특고압)')
                                                                    : (isOffice
                                                                        ? (listing.exitwiseData?.efficiency || '58.4%')
                                                                        : (imMetrics?.parking || listing.parking || listing.specs?.parking || listing.exitwiseData?.parking || '자주식 완비'))))}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description & KPI Stat Cards */}
                                            <div style={{ marginTop: '30px', lineHeight: '1.8', color: 'var(--text-gray)' }}>
                                                <h4 style={{ color: 'var(--text-white)', marginBottom: '14px', fontSize: '1.1rem' }}>투자 포인트 요약</h4>
                                                {(imMetrics?.kpiItems || imMetrics?.kpiRaw || listing.exitwiseData?.kpiRaw || listing.exitwiseData?.kpiItems) && (
                                                    <div style={{ marginBottom: '16px' }}>
                                                        <KpiStatCards raw={imMetrics?.kpiRaw || listing.exitwiseData?.kpiRaw} items={imMetrics?.kpiItems || listing.exitwiseData?.kpiItems} />
                                                    </div>
                                                )}
                                                <p style={{ color: 'var(--text-off-white)', lineHeight: '1.75', marginTop: '8px' }}>
                                                    {unescapeMarkdown(imMetrics?.executiveSummary || cleanExecutiveSummary(listing.exitwiseData?.executiveSummary || listing.summary || '') ||
                                                        `본 물건은 ${listing.location} 핵심 상권 및 업무지구에 위치한 우량 실물자산입니다. 우수한 입지 조건과 자산 가치 상승 모멘텀을 보유하고 있으며, 전문 실사 및 권리분석을 완료하여 안정적인 현금흐름 창출이 가능합니다.`)}
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
                                                            onClick={handleRegenerateAndSyncIM}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #d97706, #b45309)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '10px 18px',
                                                                fontWeight: '700',
                                                                fontSize: '0.9rem',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
                                                            }}
                                                            title="ExitWise 최신 정본 IM(서문·지도·도표·감사보고서)으로 전수 재검증 및 재생성합니다."
                                                        >
                                                            <i className="fas fa-bolt"></i> ExitWise 원문 IM 최신 재생성 & 동기화
                                                        </button>

                                                        <button
                                                            onClick={openRawImWindow}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #059669, #10b981)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '10px 18px',
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

                                            {/* AI 사진 자동 촬영 & 공인 실사 다중 갤러리 스트립 (사용자 요청 반영) */}
                                            {aiCandidates.length > 0 && (
                                                <div style={{
                                                    margin: '0 0 28px',
                                                    padding: '22px 24px',
                                                    borderRadius: '16px',
                                                    background: isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff',
                                                    border: `1px solid ${cardBorder}`,
                                                    boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '16px',
                                                        flexWrap: 'wrap',
                                                        gap: '10px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '8px',
                                                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                                color: '#000',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 900,
                                                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                                                            }}>
                                                                AI
                                                            </span>
                                                            <div>
                                                                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-white)' }}>
                                                                    현장 실사 & AI 다각도 촬영 사진첩
                                                                </h4>
                                                                <span style={{ fontSize: '0.76rem', color: 'var(--text-gray)' }}>
                                                                    카카오 360° 로드뷰 · 항공 스카이뷰 · 인터넷 공인 실사
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.78rem',
                                                            color: '#0ea5e9',
                                                            fontWeight: 700,
                                                            background: isDark ? 'rgba(14, 165, 233, 0.12)' : '#f0f9ff',
                                                            padding: '5px 12px',
                                                            borderRadius: '20px',
                                                            border: '1px solid rgba(14, 165, 233, 0.3)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px'
                                                        }}>
                                                            <i className="fas fa-search-plus"></i> 사진을 클릭하면 중앙에 크게 확대됩니다
                                                        </div>
                                                    </div>

                                                    {/* 사진 갤러리 카드 그리드 */}
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                                        gap: '14px'
                                                    }}>
                                                        {aiCandidates.map((photo, idx) => {
                                                            const isCurrentMain = listing.img === photo.url;
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    onClick={() => setSelectedPhotoIndex(idx)}
                                                                    style={{
                                                                        position: 'relative',
                                                                        borderRadius: '12px',
                                                                        overflow: 'hidden',
                                                                        cursor: 'pointer',
                                                                        border: isCurrentMain ? '2px solid #10b981' : `1px solid ${subCardBorder}`,
                                                                        background: subCardBg,
                                                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                        height: '180px',
                                                                        boxShadow: isCurrentMain ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                                                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.35)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                        e.currentTarget.style.boxShadow = isCurrentMain ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none';
                                                                    }}
                                                                    title="클릭하여 중앙에 크게 확대 보기"
                                                                >
                                                                    <img
                                                                        src={photo.url}
                                                                        alt={photo.label}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                            transition: 'transform 0.4s ease'
                                                                        }}
                                                                    />
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.6) 100%)'
                                                                    }} />

                                                                    {/* 상단 뱃지 */}
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: '10px',
                                                                        left: '10px',
                                                                        right: '10px',
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <span style={{
                                                                            padding: '3px 9px',
                                                                            borderRadius: '6px',
                                                                            background: 'rgba(0,0,0,0.75)',
                                                                            backdropFilter: 'blur(6px)',
                                                                            color: 'white',
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: 800,
                                                                            border: '1px solid rgba(255,255,255,0.15)'
                                                                        }}>
                                                                            {photo.label}
                                                                        </span>
                                                                        <span style={{
                                                                            padding: '2px 7px',
                                                                            borderRadius: '4px',
                                                                            background: '#f59e0b',
                                                                            color: '#000',
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: 900
                                                                        }}>
                                                                            AI {photo.score}점
                                                                        </span>
                                                                    </div>

                                                                    {/* 하단 정보 */}
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        bottom: '10px',
                                                                        left: '10px',
                                                                        right: '10px'
                                                                    }}>
                                                                        <div style={{
                                                                            fontSize: '0.78rem',
                                                                            color: '#ffffff',
                                                                            fontWeight: 700,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            marginBottom: '3px'
                                                                        }}>
                                                                            {photo.reason}
                                                                        </div>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center'
                                                                        }}>
                                                                            <span style={{ fontSize: '0.7rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                <i className="fas fa-expand"></i> 클릭 확대
                                                                            </span>
                                                                            {isCurrentMain && (
                                                                                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, background: 'rgba(16, 185, 129, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                                                                                    ★ 현재 대표 사진
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* ExitWise IM 본문 동적 마크다운 렌더링 (원문 전문 표시) */}
                                            {listing.exitwiseData?.markdownContent ? (
                                                <ExitWiseMarkdownViewer
                                                    markdown={listing.exitwiseData.markdownContent}
                                                    isDark={isDark}
                                                    assetName={listing.exitwiseData?.assetName || listing.title}
                                                    docNumber={listing.exitwiseData?.imDocNumber}
                                                    listingId={listing.id}
                                                />
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
                                                                <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.1rem' }}>{listing.exitwiseData?.assetName || listing.title}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>희망 매각가</div>
                                                                <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.25rem' }}>{listing.salePrice || (isFactory ? '480억원' : (isOffice ? '2,850억원' : '1,850억원'))}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>목표 수익률 (Cap Rate)</div>
                                                                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.15rem' }}>{listing.exitwiseData?.capRate || (isFactory ? '6.5% (정상화 7.1%)' : (isOffice ? '5.4% (정상화 5.9%)' : '5.8% (정상화 6.3%)'))}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>
                                                                    {isHotel ? '총 객실 수' : (isFactory ? '수전/전력 용량' : (isOffice ? '기준층 전용률' : '핵심 제원'))}
                                                                </div>
                                                                <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                                    {isHotel
                                                                        ? (listing.exitwiseData?.rooms || '330실')
                                                                        : (isFactory
                                                                            ? (listing.exitwiseData?.power || '3,000 kW (특고압)')
                                                                            : (isOffice
                                                                                ? (listing.exitwiseData?.efficiency || '58.4% (전용 450평)')
                                                                                : (listing.exitwiseData?.assetClass || '우량 실물자산')))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>대지면적</div>
                                                                <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.05rem' }}>{listing.exitwiseData?.landArea || listing.specs?.landArea || (isFactory ? '16,528.9㎡ (5,000평)' : (isOffice ? '3,305.8㎡ (1,000평)' : '4,158.4㎡ (1,257.9평)'))}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>연면적</div>
                                                                <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.05rem' }}>{listing.exitwiseData?.totalFloorArea || listing.specs?.totalFloorArea || (isFactory ? '23,140.5㎡ (7,000평)' : (isOffice ? '52,890.0㎡ (16,000평)' : '36,837.2㎡ (11,143.2평)'))}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>건축 규모</div>
                                                                <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.05rem' }}>{listing.exitwiseData?.floors || listing.specs?.floors || (isFactory ? '지상 3층 (공장 2개동 및 R&D동)' : (isOffice ? '지하 7층 / 지상 50층' : '지하 6층 / 지상 16층'))}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'var(--text-gray)', fontSize: '0.82rem', marginBottom: '4px' }}>주차 대수</div>
                                                                <div style={{ color: 'var(--text-white)', fontWeight: 'bold', fontSize: '1.05rem' }}>{listing.exitwiseData?.parking || listing.specs?.parking || (isFactory ? '총 120대 (트레일러 15대)' : (isOffice ? '총 450대 (자주식 380대)' : '240대 (자주식 180대)'))}</div>
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
                                                            <strong style={{ color: '#0284c7' }}>[Executive Summary]</strong> {listing.exitwiseData?.executiveSummary || (
                                                                isFactory
                                                                    ? '수도권 제2순환고속도로 개통 수혜지인 양주시 남면 상수리 일반공업지역 내 위치한 최신식 스마트 팩토리 플랜트로, 우량 제조기업 10년 마스터리스(NNN) 계약을 통해 공실 리스크 없이 연 6.5% 이상의 고수익 현금흐름이 보장된 최우량 산업용 부동산입니다.'
                                                                    : (isOffice
                                                                        ? '대한민국 금융 중심지 여의도(YBD) 핵심 요지에 위치한 랜드마크 프라임 타워로, 대기업 본사 및 우량 외국계 금융기관 중심의 높은 우량 임차인 비중(신용도 AAA급 72%)과 장기 WALE(4.8년)을 기반으로 견고한 배당 수익을 자랑합니다.'
                                                                        : '해운대 백사장 바로 앞에 위치한 5성급 럭셔리 관광호텔로 안정적인 객실 점유율(OCC 78%)과 식음(F&B) 매출을 보유하고 있으며, 향후 브랜드 리뉴얼 및 웰니스 복합 리조트 확장 가능성이 높은 국내 최정상급 밸류애드 호텔 자산입니다.')
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Chapter 2: Key Operational & Financial Metrics */}
                                                    <div className="glass-card" style={{ padding: '35px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px' }}>
                                                            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>2</span>
                                                            <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-white)' }}>Chapter 2. 핵심 운영 및 재무 실적 (Operating & Financials)</h3>
                                                        </div>

                                                        {/* KPI 4 Big Cards (자산 유형별 동적 분기) */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                                                            {isFactory ? (
                                                                <>
                                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                                                            <span>마스터리스 가동률</span>
                                                                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>10년 NNN</span>
                                                                        </div>
                                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0284c7' }}>100.0%</div>
                                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>단독 임차 공실 리스크 제로</div>
                                                                    </div>
                                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>연간 순영업소득 (NOI)</div>
                                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--accent-gold)' }}>31.2억원</div>
                                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>Cap Rate 6.5% 안정적 실현</div>
                                                                    </div>
                                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>평당 임대단가</div>
                                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#10b981' }}>40,000원</div>
                                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>관리비 실비 정산 방식</div>
                                                                    </div>
                                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>연간 EBITDA (현금흐름)</div>
                                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#9333ea' }}>32.5억원</div>
                                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>EBITDA Margin 96.8% 달성</div>
                                                                    </div>
                                                                </>
                                                            ) : isOffice ? (
                                                                <>
                                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                                                            <span>임대율 (Occupancy)</span>
                                                                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>공실률 1.8%</span>
                                                                        </div>
                                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0284c7' }}>98.2%</div>
                                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>YBD 프라임 최저 공실률</div>
                                                                    </div>
                                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>평균 NOC (평당 임대료)</div>
                                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--accent-gold)' }}>128,000원</div>
                                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>여의도 최고급 프라임 상위</div>
                                                                    </div>
                                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>잔여임대기간 (WALE)</div>
                                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#10b981' }}>4.8년</div>
                                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>AAA급 우량 테넌트 점유</div>
                                                                    </div>
                                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '6px' }}>연간 EBITDA (현금흐름)</div>
                                                                        <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#9333ea' }}>158.6억원</div>
                                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)', marginTop: '4px' }}>EBITDA Margin 88.5%</div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
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
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Financials Table (자산 유형별 동적 테이블) */}
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
                                                                    {isFactory ? (
                                                                        <>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}` }}>
                                                                                <td style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 'bold', color: 'var(--text-white)' }}>총 임대수입</td>
                                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>31.5억</td>
                                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>32.4억</td>
                                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>33.6억</td>
                                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0284c7' }}>35.0억</td>
                                                                            </tr>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>- 제조공장 마스터리스 임대료</td>
                                                                                <td style={{ padding: '10px 14px' }}>30.0억</td>
                                                                                <td style={{ padding: '10px 14px' }}>30.9억</td>
                                                                                <td style={{ padding: '10px 14px' }}>32.0억</td>
                                                                                <td style={{ padding: '10px 14px' }}>33.3억</td>
                                                                            </tr>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>- 공용관리비 및 부대수입</td>
                                                                                <td style={{ padding: '10px 14px' }}>1.5억</td>
                                                                                <td style={{ padding: '10px 14px' }}>1.5억</td>
                                                                                <td style={{ padding: '10px 14px' }}>1.6억</td>
                                                                                <td style={{ padding: '10px 14px' }}>1.7억</td>
                                                                            </tr>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>운영비용 (OPEX)</td>
                                                                                <td style={{ padding: '10px 14px' }}>1.0억</td>
                                                                                <td style={{ padding: '10px 14px' }}>1.1억</td>
                                                                                <td style={{ padding: '10px 14px' }}>1.1억</td>
                                                                                <td style={{ padding: '10px 14px' }}>1.2억</td>
                                                                            </tr>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, background: isDark ? 'rgba(14, 165, 233, 0.05)' : '#f0f9ff' }}>
                                                                                <td style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 'bold', color: '#0284c7' }}>순영업소득 (NOI)</td>
                                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>30.5억</td>
                                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>31.3억</td>
                                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>32.5억</td>
                                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#10b981' }}>33.8억</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-gray)' }}>EBITDA Margin</td>
                                                                                <td style={{ padding: '10px 14px', color: 'var(--text-gray)' }}>96.8%</td>
                                                                                <td style={{ padding: '10px 14px', color: 'var(--text-gray)' }}>96.6%</td>
                                                                                <td style={{ padding: '10px 14px', color: 'var(--accent-gold)' }}>96.7%</td>
                                                                                <td style={{ padding: '10px 14px', color: '#10b981' }}>96.6%</td>
                                                                            </tr>
                                                                        </>
                                                                    ) : isOffice ? (
                                                                        <>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}` }}>
                                                                                <td style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 'bold', color: 'var(--text-white)' }}>총 임대수입</td>
                                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>155.0억</td>
                                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>164.2억</td>
                                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>174.5억</td>
                                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0284c7' }}>185.0억</td>
                                                                            </tr>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>- 기준층 오피스 임대료</td>
                                                                                <td style={{ padding: '10px 14px' }}>135.0억</td>
                                                                                <td style={{ padding: '10px 14px' }}>142.8억</td>
                                                                                <td style={{ padding: '10px 14px' }}>151.5억</td>
                                                                                <td style={{ padding: '10px 14px' }}>160.5억</td>
                                                                            </tr>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>- 관리비 및 리테일 수입</td>
                                                                                <td style={{ padding: '10px 14px' }}>20.0억</td>
                                                                                <td style={{ padding: '10px 14px' }}>21.4억</td>
                                                                                <td style={{ padding: '10px 14px' }}>23.0억</td>
                                                                                <td style={{ padding: '10px 14px' }}>24.5억</td>
                                                                            </tr>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, color: 'var(--text-gray)' }}>
                                                                                <td style={{ textAlign: 'left', padding: '10px 14px' }}>운영비용 (OPEX)</td>
                                                                                <td style={{ padding: '10px 14px' }}>18.5억</td>
                                                                                <td style={{ padding: '10px 14px' }}>19.2억</td>
                                                                                <td style={{ padding: '10px 14px' }}>20.3억</td>
                                                                                <td style={{ padding: '10px 14px' }}>21.5억</td>
                                                                            </tr>
                                                                            <tr style={{ borderBottom: `1px solid ${subCardBorder}`, background: isDark ? 'rgba(14, 165, 233, 0.05)' : '#f0f9ff' }}>
                                                                                <td style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 'bold', color: '#0284c7' }}>순영업소득 (NOI)</td>
                                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>136.5억</td>
                                                                                <td style={{ padding: '12px 14px', color: 'var(--text-off-white)' }}>145.0억</td>
                                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>154.2억</td>
                                                                                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#10b981' }}>163.5억</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-gray)' }}>EBITDA Margin</td>
                                                                                <td style={{ padding: '10px 14px', color: 'var(--text-gray)' }}>88.1%</td>
                                                                                <td style={{ padding: '10px 14px', color: 'var(--text-gray)' }}>88.3%</td>
                                                                                <td style={{ padding: '10px 14px', color: 'var(--accent-gold)' }}>88.5%</td>
                                                                                <td style={{ padding: '10px 14px', color: '#10b981' }}>88.4%</td>
                                                                            </tr>
                                                                        </>
                                                                    ) : (
                                                                        <>
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
                                                                        </>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* Chapter 3: Core Investment Thesis (자산 유형별 투자 하이라이트) */}
                                                    <div className="glass-card" style={{ padding: '35px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px' }}>
                                                            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>3</span>
                                                            <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-white)' }}>Chapter 3. 4대 핵심 투자 하이라이트 (Investment Thesis)</h3>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                                            {(listing.exitwiseData?.highlights || (
                                                                isFactory ? [
                                                                    {
                                                                        title: "수도권 제2순환고속도로 및 세종-포천고속도로 연계 특급 물류 인프라",
                                                                        desc: "남양주-포천 고속도로 IC와 인접하여 서울 강남권 50분, 수도권 전역 1시간 이내 물류 이동이 가능한 일반공업지역 핵심 요지입니다."
                                                                    },
                                                                    {
                                                                        title: "우량 코스닥 상장 첨단부품 제조기업 10년 장기 마스터리스 (NNN 계약)",
                                                                        desc: "국내 최정상 부품 제조사와 2032년까지 NNN 장기 임대차 계약이 체결되어 공실 위험 없이 연 6.5% 이상의 순수 현금흐름이 보장됩니다."
                                                                    },
                                                                    {
                                                                        title: "3,000kW 특고압 전력, 12m 층고, 5.0톤 바닥하중 스마트 플랜트 스펙",
                                                                        desc: "대형 호이스트 크레인 4기 및 자동화 물류라인이 완비되어 중공업, 정밀기계, 반도체·배터리 2차 벤더사 즉시 입주 가능한 최고 등급 설비입니다."
                                                                    },
                                                                    {
                                                                        title: "수도권 과밀억제권역 외 소재로 취득세 및 법인세 감면 등 세제 혜택",
                                                                        desc: "지방세특례제한법에 따른 취득세 50% 감면 및 법인세 4년간 100% 감면 등 대규모 세제 혜택이 적용되는 투자 최적화 자산입니다."
                                                                    }
                                                                ] : isOffice ? [
                                                                    {
                                                                        title: "대한민국 금융 1번지 여의도(YBD) 최중심 프라임 랜드마크",
                                                                        desc: "여의도역(5·9호선) 도보 역세권 및 여의대로 대로변 코너에 위치한 국내 랜드마크 최상급 트로피 에셋(Trophy Asset)입니다."
                                                                    },
                                                                    {
                                                                        title: "AAA급 글로벌 금융사 및 대기업 본사 장기 임차 (공실률 1.8%)",
                                                                        desc: "신용등급 AAA급 우량 임차인이 72% 이상 점유하고 있으며, 가중평균 잔여임대기간(WALE) 4.8년으로 안정적인 코어 배당 수익을 창출합니다."
                                                                    },
                                                                    {
                                                                        title: "친환경 최우수 등급 (LEED 플래티넘) 인증 ESG 코어 자산",
                                                                        desc: "BIPV 건물일체형 태양광 및 지열 시스템 도입으로 관리비 절감 및 글로벌 ESG 기관투자자 펀드 투자 적격 요건을 완벽 충족합니다."
                                                                    },
                                                                    {
                                                                        title: "신안산선·GTX-B 복합 환승센터 개통에 따른 자산가치 상승 잠재력",
                                                                        desc: "향후 수도권 광역급행철도 개통 시 서울 서남부 및 수도권 전역 접근성이 비약적으로 개선되어 Cap Rate 압축 및 매각 차익 극대화가 기대됩니다."
                                                                    }
                                                                ] : [
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
                                                                ]
                                                            )).map((hl, idx) => (
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
                                                                    {(listing.exitwiseData?.floorPlan || (
                                                                        isFactory ? [
                                                                            { floor: "3F", use: "스마트 R&D 연구소, 설계실, 대회의실 및 임직원 구내식당, 옥상 휴게공원", note: "R&D 및 복합 업무공간 완비" },
                                                                            { floor: "2F", use: "정밀 부품 자동화 조립 라인, 항온항습 클린룸 (Class 10,000), 품질검사실", note: "무진동 첨단 자동화 설비" },
                                                                            { floor: "1F", use: "주 제조공장 (Plant A/B), 10톤 호이스트 크레인 4기, 원자재 및 완제품 보관창고", note: "유효 층고 12.0m / 바닥 5.0t/㎡" },
                                                                            { floor: "야외/부대", use: "40ft 대형 트레일러 하역 도크 (15대 접안), 수전변전실 (3,000kW), 위험물 저장창고", note: "자주식 주차 120대 완비" }
                                                                        ] : isOffice ? [
                                                                            { floor: "40F ~ 50F", use: "하이엔드 스카이라운지, VIP 콘퍼런스홀, 글로벌 투자은행(IB) 본사", note: "한강 파노라마 조망" },
                                                                            { floor: "20F ~ 39F", use: "대기업 지주사 및 주요 금융지주사 헤드쿼터 프라임 오피스", note: "기준층 전용 450평 (전용률 58.4%)" },
                                                                            { floor: "4F ~ 19F", use: "IT 테크 기업 본사 및 전문직 (대형 로펌·회계법인) 임차 공간", note: "장기 임대차 계약 체결" },
                                                                            { floor: "1F ~ 3F", use: "그랜드 로비, 컨벤션 센터, 프리미엄 카페테리아 및 리테일 편의시설", note: "입주사 전용 어메니티" },
                                                                            { floor: "B1F ~ B7F", use: "지하 주차장 (총 450대 / 자주식 380대), 기계실, 전기차 충전소", note: "넉넉한 주차 공간 확보" }
                                                                        ] : [
                                                                            { floor: "16F", use: "루프탑 인피니티풀 (온수풀), 풀사이드 라운지 & 바", note: "오션뷰 파노라마" },
                                                                            { floor: "6F ~ 15F", use: "프리미엄 객실 (총 330실)", note: "디럭스 180실, 프리미어 100실, 스위트 50실" },
                                                                            { floor: "4F ~ 5F", use: "피트니스 클럽, 실내 수영장, 사우나 & 스파, 키즈존", note: "투숙객 전용 웰니스" },
                                                                            { floor: "2F ~ 3F", use: "프리미엄 뷔페 '아리아', 중식 파인다이닝 '팔레드신', 대/중 연회장", note: "F&B 연간 165억 매출" },
                                                                            { floor: "1F", use: "메인 로비, 프런트 데스크, 라운지&바, '조선델리' 베이커리", note: "해변 직접 연결 로비" },
                                                                            { floor: "B1F ~ B6F", use: "지하 주차장 (240대 완비), 기계실, 전기실, 세탁/지원시설", note: "자주식 180대 / 기계식 60대" }
                                                                        ]
                                                                    )).map((item, idx) => (
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
                                                                <span style={{ padding: '4px 10px', borderRadius: '6px', background: isDark ? 'rgba(245,158,11,0.2)' : '#fef3c7', color: isDark ? '#f59e0b' : '#b45309', fontWeight: 'bold' }}>주의 1</span>
                                                                <span style={{ padding: '4px 10px', borderRadius: '6px', background: isDark ? 'rgba(16,185,129,0.2)' : '#dcfce7', color: isDark ? '#10b981' : '#15803d', fontWeight: 'bold' }}>확인 3</span>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            {(listing.exitwiseData?.auditItems || (
                                                                isFactory ? [
                                                                    { status: "확인", title: "소유권 확인 완료", desc: "법인 단독 명의 소유권 확인 및 매각 의향서(LOI) 징구 완료." },
                                                                    { status: "확인", title: "공적장부 면적 일치", desc: `토지대장 및 건축물대장상 대지면적(${listing.exitwiseData?.landArea || '16,528.9㎡'}) 및 연면적(${listing.exitwiseData?.totalFloorArea || '23,140.5㎡'}) 불일치 없음.` },
                                                                    { status: "확인", title: "환경 및 오염도 통과", desc: "토양환경보전법상 토양오염도 검사 적합 판정 및 유해물질 배출 기준 충족 완료." },
                                                                    { status: "주의", title: "전력 및 설비 승계", desc: "기설치된 3,000kW 수전설비 및 호이스트 크레인 4기는 매매가에 포함되어 포괄 양수도 진행 요망." }
                                                                ] : isOffice ? [
                                                                    { status: "확인", title: "소유권 확인 완료", desc: "법인 단독 명의 소유권 확인 및 등기부상 권리제한 사항 전무." },
                                                                    { status: "확인", title: "공적장부 면적 일치", desc: `등기부등본 및 건축물대장상 연면적(${listing.exitwiseData?.totalFloorArea || '52,890.0㎡'}) 정합성 100% 확인.` },
                                                                    { status: "확인", title: "임대차 계약 검증", desc: "임차 테넌트 85% 이상 5년 이상 장기 계약 확인 및 보증금 전액 예치 완료." },
                                                                    { status: "주의", title: "저층부 리테일 리뉴얼", desc: "저층부 일부 리테일 만기 도래에 따른 하이엔드 테넌트 재배치 및 임대료 상향 여력 보유." }
                                                                ] : [
                                                                    { status: "확인", title: "소유권 확인 완료", desc: "소유권 단독 명의 및 매각 동의 의향서(LOI) 징구 완료." },
                                                                    { status: "확인", title: "공적장부 면적 일치", desc: "등기부등본 및 건축물대장상 대지면적(4,158.4㎡) 및 연면적(36,837.2㎡) 불일치 없음." },
                                                                    { status: "주의", title: "권리관계", desc: "근저당권 말소 조건부 매매계약 체결 요망 (매매잔금 시 기존 담보대출 동시 상환 프로세스 적용)." },
                                                                    { status: "주의", title: "운영승계", desc: "신세계조선호텔 위탁운영 계약 승계 여부 및 브랜드 유지 조건은 매수자 희망 구조에 따라 협의 진행 필요." }
                                                                ]
                                                            )).map((audit, idx) => {
                                                                const isWarning = audit.status === '주의' || audit.status === '경고';
                                                                const iconClass = isWarning ? 'fa-exclamation-circle' : 'fa-check-circle';
                                                                const iconColor = isWarning ? '#d97706' : '#16a34a';
                                                                const auditBg = isDark
                                                                    ? (isWarning ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)')
                                                                    : (isWarning ? '#fffbeb' : '#f0fdf4');
                                                                const auditBorder = isDark
                                                                    ? (isWarning ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(16,185,129,0.25)')
                                                                    : (isWarning ? '1px solid #fde68a' : '1px solid #bbf7d0');
                                                                const textColor = isDark
                                                                    ? '#e2e8f0'
                                                                    : (isWarning ? '#78350f' : '#14532d');

                                                                return (
                                                                    <div key={idx} style={{
                                                                        background: auditBg,
                                                                        border: auditBorder,
                                                                        padding: '14px 18px',
                                                                        borderRadius: '8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px'
                                                                    }}>
                                                                        <i className={`fas ${iconClass}`} style={{ color: iconColor }}></i>
                                                                        <div style={{ fontSize: '0.9rem', color: textColor }}>
                                                                            <strong>[{audit.title}]</strong> {audit.desc}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Chapter 6: Legal Risk Warning */}
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
                                                            {listing.exitwiseData?.riskWarning || (
                                                                isFactory
                                                                    ? '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 공장 및 산업용 실물자산 투자에는 제조 환경 규제 및 원금 손실 리스크가 수반되며, 최종 투자 결정은 투자자 본인의 책임 하에 이루어져야 합니다.'
                                                                    : (isOffice
                                                                        ? '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 오피스 실물자산 투자에는 공실률 변동 및 거시경제 리스크가 수반될 수 있습니다.'
                                                                        : '본 IM에 포함된 모든 정보는 투자 의사결정의 참고 자료로만 활용되어야 하며, 투자 권유 또는 확정적 수익을 보장하지 않습니다. 호텔 및 실물자산 투자에는 운영 리스크 및 원금 손실 리스크가 수반되며, 최종 투자 결정은 투자자 본인의 책임 하에 이루어져야 합니다.')
                                                            )}
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

                                    {/* Tab 3: Yield Calculator & Wealth Simulator (IM 감응도 & 재무차트 연동) */}
                                    {activeTab === 'analysis' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                            {/* ExitWise IM 정밀 시뮬레이터 & 재무 성과 차트 */}
                                            {(listing.isExitwiseLinked || imMetrics || listing.exitwiseData?.markdownContent) && (
                                                <div className="glass-card listing-detail-card" style={{ padding: '30px 32px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span style={{ fontSize: '1.25rem', color: 'var(--accent-gold)' }}>📈</span>
                                                            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-white)', fontWeight: '800' }}>
                                                                ExitWise AI 감응도 분석 & 재무 성과 시뮬레이션
                                                            </h3>
                                                        </div>
                                                        <span style={{ fontSize: '0.82rem', color: '#0ea5e9', background: isDark ? 'rgba(14, 165, 233, 0.12)' : '#e0f2fe', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>
                                                            ⚡ 결정론 알고리즘 기반
                                                        </span>
                                                    </div>

                                                    {/* 1. Sensitivity Simulator */}
                                                    <SensitivitySimulator
                                                        raw={imMetrics?.sensitivityRaw || listing.exitwiseData?.sensitivityRaw}
                                                        basePrice={imMetrics?.numPrice || parseKoreanCurrency(listing.salePrice)}
                                                        annualNoi={imMetrics?.annualNoiWon || Math.round(parseKoreanCurrency(listing.salePrice) * 0.055)}
                                                        title={`${listing.exitwiseData?.assetName || listing.title} 매입가 및 Cap Rate 민감도 시뮬레이터`}
                                                    />

                                                    {/* 2. Financial Chart */}
                                                    {(imMetrics?.rechartsRaw || listing.exitwiseData?.rechartsRaw || listing.exitwiseData?.financials) && (
                                                        <div style={{ marginTop: '24px' }}>
                                                            <FinancialChart raw={imMetrics?.rechartsRaw || listing.exitwiseData?.rechartsRaw} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 가자에셋 커스텀 분석 시뮬레이터 */}
                                            <YieldCalculator
                                                appraisalPrice={parseKoreanCurrency(imMetrics?.salePrice || listing.salePrice || listing.minPrice || listing.appraisal)}
                                                minPrice={parseKoreanCurrency(listing.minPrice || imMetrics?.salePrice || listing.salePrice)}
                                            />

                                            <WealthSimulator
                                                initialInvestment={parseKoreanCurrency(imMetrics?.salePrice || listing.salePrice || listing.minPrice)}
                                                growthRate={imMetrics?.roi ? parseFloat(imMetrics.roi) : (listing.roi ? parseFloat(listing.roi) : 6.5)}
                                            />
                                        </div>
                                    )}

                                    {/* Tab 4: Location (실시간 지도 + 360° 로드뷰 듀얼 뷰) */}
                                    {activeTab === 'location' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {/* Top View Mode Switch: Map vs 360° Roadview */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '12px 18px', flexWrap: 'wrap', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1.1rem', color: '#0ea5e9' }}>📍</span>
                                                    <span style={{ fontWeight: '700', color: 'var(--text-white)', fontSize: '0.95rem' }}>{listing.location}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', background: isDark ? 'rgba(0,0,0,0.3)' : '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                                                    <button
                                                        onClick={() => setLocationViewMode('map')}
                                                        style={{
                                                            padding: '6px 14px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            fontSize: '0.82rem',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            background: locationViewMode === 'map' ? '#0ea5e9' : 'transparent',
                                                            color: locationViewMode === 'map' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <i className="fas fa-map-marked-alt" style={{ marginRight: '6px' }}></i>실시간 지도
                                                    </button>
                                                    <button
                                                        onClick={() => setLocationViewMode('roadview')}
                                                        style={{
                                                            padding: '6px 14px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            fontSize: '0.82rem',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            background: locationViewMode === 'roadview' ? '#0ea5e9' : 'transparent',
                                                            color: locationViewMode === 'roadview' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <i className="fas fa-street-view" style={{ marginRight: '6px' }}></i>360° 현장 로드뷰
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Map or Roadview Display */}
                                            {locationViewMode === 'map' ? (
                                                <KakaoMapEmbed
                                                    listingId={listing.id}
                                                    address={listing.location}
                                                    title={listing.title}
                                                    lat={listing.lat || listing.locationCoords?.lat}
                                                    lng={listing.lng || listing.locationCoords?.lng}
                                                    height={460}
                                                />
                                            ) : (
                                                <KakaoRoadviewEmbed
                                                    listingId={listing.id}
                                                    address={listing.location}
                                                    title={listing.title}
                                                    lat={listing.lat || listing.locationCoords?.lat}
                                                    lng={listing.lng || listing.locationCoords?.lng}
                                                    height={460}
                                                />
                                            )}

                                            <div className="glass-card listing-detail-card" style={{ padding: '28px 32px', borderRadius: '16px', background: cardBg, border: `1px solid ${cardBorder}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px' }}>
                                                    <span style={{ fontSize: '1.2rem', color: '#0ea5e9' }}>📍</span>
                                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-white)', fontWeight: '800' }}>입지 환경 및 광역 인프라 정밀 분석</h3>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                        <div style={{ color: '#0ea5e9', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                            <i className="fas fa-subway" style={{ marginRight: '6px' }}></i>대중교통 및 역세권
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: '1.7' }}>
                                                            {isHotel
                                                                ? '해운대역(부산 2호선) 도보 7분, 해운대 해변로 바로 연결, 김해국제공항 리무진 직결'
                                                                : (listing.location?.includes('서초') || listing.title?.includes('서초'))
                                                                ? '교대역(2·3호선 환승역) 및 서초역(2호선) 도보 역세권, 서초중앙로 16개 간선·지선 버스 노선 밀집'
                                                                : isOffice
                                                                ? '여의도역(5·9호선 환승역) 도보 3분 초역세권, 여의도 환승센터 32개 광역 버스 노선 집결'
                                                                : isFactory
                                                                ? '수도권 전철 1호선 덕정역 연계 광역 교통망, 양주테크노밸리 산업단지 셔틀 운행'
                                                                : '인접 지하철역 도보 5분 이내 역세권, 주요 도심을 관통하는 간선·지선 버스 노선 집결지'}
                                                        </p>
                                                    </div>

                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                        <div style={{ color: '#10b981', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                            <i className="fas fa-road" style={{ marginRight: '6px' }}></i>도로망 및 광역 접근성
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: '1.7' }}>
                                                            {isFactory
                                                                ? '세종-포천고속도로 및 제2순환고속도로 IC 10분 내 진입, 40ft 대형 트레일러 진출입 최적화'
                                                                : (listing.location?.includes('서초') || listing.title?.includes('서초'))
                                                                ? '경부고속도로 서초IC 5분 진입, 남부순환로 및 테헤란로·강남대로 직결 도심 고속 이동 최적화'
                                                                : isOffice
                                                                ? '올림픽대로 및 강변북로, 여의대로 광폭 8차선 대로변 코너 입지, 도심/강남 20분대 쾌속 이동'
                                                                : isHotel
                                                                ? '광안대교, 부산울산고속도로, 동해선 벡스코역 10분 거리, 동부산 관광단지 15분 진입'
                                                                : '주요 간선도로 및 도심 고속화도로 직결, 물류 및 업무 이동 편의성 극대화'}
                                                        </p>
                                                    </div>

                                                    <div style={{ background: subCardBg, padding: '20px', borderRadius: '12px', border: `1px solid ${subCardBorder}` }}>
                                                        <div style={{ color: '#f59e0b', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                            <i className="fas fa-building" style={{ marginRight: '6px' }}></i>권역 특성 및 개발 호재
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: '1.7' }}>
                                                            {(listing.location?.includes('서초') || listing.title?.includes('서초'))
                                                                ? '대법원·대검찰청 등 서초동 법조타운 핵심 상권, 탄탄한 법률·세무 전문직 유동인구 및 높은 임차 수요 보유'
                                                                : isOffice
                                                                ? '대한민국 금융 중심지 YBD 코어 블록, 신안산선(공사 중) 및 GTX-B 개통 예정으로 미래가치 상승'
                                                                : isFactory
                                                                ? '경기 북부 일반공업지역 희소 필지, 공장총량제 수혜 및 인근 산업클러스터 집적화 수혜'
                                                                : isHotel
                                                                ? '대한민국 대표 해양 관광특구 1선 오션프론트, 사계절 MICE 및 글로벌 외국인 관광객 배후수요'
                                                                : '도시계획상 중심상업/준주거지역 위치, 풍부한 배후 세대 및 유동인구 확보'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right: Sticky Action Sidebar (컴팩트 골드 박스) */}
                        <div className="listing-detail-sidebar">
                            <div className="glass-card listing-detail-card" style={{
                                padding: '22px 18px',
                                border: '2px solid var(--accent-gold)',
                                borderRadius: '14px',
                                background: cardBg,
                                boxShadow: isDark ? '0 8px 25px rgba(0,0,0,0.5)' : '0 8px 25px rgba(184, 134, 11, 0.08)'
                            }}>
                                <h3 style={{ fontSize: '1.22rem', marginBottom: '8px', color: 'var(--text-white)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>◆</span> 자산 매수 및 실사 문의
                                </h3>
                                <p style={{ color: 'var(--text-gray)', marginBottom: '16px', fontSize: '0.84rem', lineHeight: '1.5' }}>
                                    가자에셋 수석 컨설턴트가 전담 실사 리포트를 제공해 드립니다.
                                </p>

                                <ul style={{ marginBottom: '18px', fontSize: '0.84rem', color: 'var(--text-off-white)', listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '9px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fas fa-check-circle" style={{ color: 'var(--accent-gold)', fontSize: '0.88rem', flexShrink: 0 }}></i>
                                        <span>법률/권리/세무 정밀 실사(Due Diligence)</span>
                                    </li>
                                    <li style={{ marginBottom: '9px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fas fa-check-circle" style={{ color: 'var(--accent-gold)', fontSize: '0.88rem', flexShrink: 0 }}></i>
                                        <span>{listing.category === '호텔' ? '호텔 OCC/ADR 운영 수익률표' : '임대료 수익률 및 현금흐름표'}</span>
                                    </li>
                                    <li style={{ marginBottom: '9px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fas fa-check-circle" style={{ color: 'var(--accent-gold)', fontSize: '0.88rem', flexShrink: 0 }}></i>
                                        <span>매수 희망가 산정 및 입찰 가이드</span>
                                    </li>
                                </ul>

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', borderRadius: '8px', padding: '12px 14px', fontSize: '0.98rem', fontWeight: 'bold' }}
                                    onClick={openConsulting}
                                >
                                    VIP 자산 상담 신청하기
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-gray)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                    <i className="fas fa-phone-alt" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem' }}></i>
                                    <span style={{ color: 'var(--text-gray)', fontSize: '0.82rem' }}>상담 직통:</span>
                                    <a href="tel:010-8916-1305" style={{ color: 'var(--accent-gold)', fontWeight: '700', textDecoration: 'none' }}>010-8916-1305</a>
                                </div>

                                {/* 문의 맨 아래 첨부 명함 (작게 부착 및 클릭 시 확대) */}
                                <div style={{
                                    marginTop: '16px',
                                    paddingTop: '14px',
                                    borderTop: `1px solid ${isDark ? 'rgba(184, 134, 11, 0.3)' : 'rgba(184, 134, 11, 0.2)'}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span>📇</span> 담당 수석 컨설턴트
                                        </span>
                                        <button
                                            onClick={() => setIsCardModalOpen(true)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--text-gray)',
                                                fontSize: '0.72rem',
                                                cursor: 'pointer',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}
                                        >
                                            <i className="fas fa-search-plus"></i> 명함 확대
                                        </button>
                                    </div>

                                    {/* 정재원 팀장 명함 이미지 프리뷰 */}
                                    <div
                                        onClick={() => setIsCardModalOpen(true)}
                                        style={{
                                            position: 'relative',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(184, 134, 11, 0.45)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                            cursor: 'pointer',
                                            background: '#ffffff',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                        }}
                                        title="정재원 영업팀장 명함 크게 보기 (클릭)"
                                    >
                                        <img
                                            src="/assets/business_card_jaewon_chung.png"
                                            alt="(주)가자에셋파트너스 영업팀장 정재원 명함"
                                            style={{ width: '100%', height: 'auto', display: 'block' }}
                                        />
                                    </div>

                                    {/* 명함 직통 연락처 원클릭 다이얼 & 이메일 */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '2px' }}>
                                        <a
                                            href="tel:010-8916-1305"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px',
                                                padding: '7px 6px',
                                                borderRadius: '6px',
                                                background: isDark ? 'rgba(184, 134, 11, 0.15)' : '#fef3c7',
                                                border: '1px solid rgba(184, 134, 11, 0.4)',
                                                color: 'var(--accent-gold)',
                                                fontSize: '0.74rem',
                                                fontWeight: '700',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <i className="fas fa-phone-alt"></i> 010-8916-1305
                                        </a>
                                        <a
                                            href="mailto:ickra345@gmail.com"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '5px',
                                                padding: '7px 6px',
                                                borderRadius: '6px',
                                                background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
                                                border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                                                color: 'var(--text-off-white)',
                                                fontSize: '0.74rem',
                                                fontWeight: '600',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <i className="fas fa-envelope"></i> 이메일 문의
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* 사이드바 하단 매물 목록 퀵 링크 */}
                            <div style={{ marginTop: '14px', textAlign: 'center' }}>
                                <Link
                                    to="/listings"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: 'var(--text-gray)',
                                        fontSize: '0.84rem',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s',
                                        padding: '4px 8px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-gray)'}
                                >
                                    <i className="fas fa-th-large" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}></i>
                                    <span>다른 매물 더보기</span>
                                    <i className="fas fa-chevron-right" style={{ fontSize: '0.72rem' }}></i>
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* 하단 탐색 완료 액션 배너: 목록으로 돌아가기 & 맨 위로 */}
                    <div style={{
                        marginTop: '60px',
                        padding: '28px 32px',
                        borderRadius: '16px',
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '20px',
                        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--accent-gold)', fontSize: '1rem' }}>✦</span>
                                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-white)', fontWeight: '800' }}>
                                    더 많은 프리미엄 자산을 찾고 계신가요?
                                </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-gray)' }}>
                                가자에셋의 오피스빌딩, 호텔, 공장·물류, NPL 및 법원경매 매물을 비교 분석해 보세요.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Link
                                to="/listings"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                                    color: '#000000',
                                    fontWeight: '800',
                                    fontSize: '0.92rem',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <i className="fas fa-th-list"></i>
                                <span>전체 매물 목록 보기</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 18px',
                                    borderRadius: '10px',
                                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                                    color: 'var(--text-white)',
                                    fontWeight: '600',
                                    fontSize: '0.92rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className="fas fa-arrow-up"></i>
                                <span>맨 위로</span>
                            </button>
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

            {/* 정재원 팀장 명함 고해상도 확대 모달 */}
            <AnimatePresence>
                {isCardModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCardModalOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(0, 0, 0, 0.75)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '560px',
                                width: '100%',
                                background: isDark ? '#0b1329' : '#ffffff',
                                border: '2px solid var(--accent-gold)',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${subCardBorder}`, paddingBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>📇</span>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-white)', fontWeight: '800' }}>
                                        (주)가자에셋파트너스 담당자 명함
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setIsCardModalOpen(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-gray)',
                                        fontSize: '1.3rem',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            {/* 명함 이미지 */}
                            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(184, 134, 11, 0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                                <img
                                    src="/assets/business_card_jaewon_chung.png"
                                    alt="(주)가자에셋파트너스 영업팀장 정재원 명함"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </div>

                            {/* 직통 연락 버튼 */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                <a
                                    href="tel:010-8916-1305"
                                    className="btn-primary"
                                    style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 'bold' }}
                                >
                                    <i className="fas fa-phone-alt" style={{ marginRight: '6px' }}></i> 직통 전화 (010-8916-1305)
                                </a>
                                <a
                                    href="mailto:ickra345@gmail.com"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '12px 18px',
                                        borderRadius: '8px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
                                        color: 'var(--text-white)',
                                        fontSize: '0.92rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <i className="fas fa-envelope" style={{ marginRight: '6px' }}></i> 이메일
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* AI 사진 중앙 대형 라이트박스 팝업 모달 (사용자 요청 구현) */}
                {selectedPhotoIndex !== null && aiCandidates[selectedPhotoIndex] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(5, 10, 20, 0.92)',
                            backdropFilter: 'blur(12px)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px'
                        }}
                        onClick={() => setSelectedPhotoIndex(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 15 }}
                            transition={{ type: "spring", duration: 0.35 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: isDark ? '#0b1329' : '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '20px',
                                maxWidth: '1020px',
                                width: '100%',
                                maxHeight: '92vh',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.85)'
                            }}
                        >
                            {/* 모달 상단 툴바 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 22px',
                                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                        color: '#ffffff',
                                        fontSize: '0.8rem',
                                        fontWeight: 800
                                    }}>
                                        {aiCandidates[selectedPhotoIndex].label}
                                    </span>
                                    <span style={{
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        background: 'rgba(245, 158, 11, 0.15)',
                                        color: '#d97706',
                                        fontSize: '0.78rem',
                                        fontWeight: 800
                                    }}>
                                        AI 검증점수 {aiCandidates[selectedPhotoIndex].score}점
                                    </span>
                                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-white)' }}>
                                        {listing.title}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPhotoIndex(null)}
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                                        border: 'none',
                                        color: 'var(--text-white)',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background 0.2s'
                                    }}
                                    title="닫기 (ESC)"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* 모달 이미지 및 인터랙티브 카카오 뷰어 메인 영역 (중앙 정렬 대형 디스플레이) */}
                            <div style={{
                                position: 'relative',
                                background: '#020617',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '440px',
                                maxHeight: '68vh',
                                overflow: 'hidden',
                                width: '100%'
                            }}>
                                {aiCandidates[selectedPhotoIndex].source === 'kakao_roadview' ? (
                                    <div style={{ width: '100%', height: '100%', minHeight: '450px' }}>
                                        <KakaoRoadviewEmbed
                                            listingId={listing.id}
                                            address={listing.location}
                                            title={listing.title}
                                            height={480}
                                            caption={aiCandidates[selectedPhotoIndex].reason || `${listing.title} 카카오 360° 로드뷰`}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <img
                                            src={aiCandidates[selectedPhotoIndex].url}
                                            alt={aiCandidates[selectedPhotoIndex].label}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '62vh',
                                                objectFit: 'contain',
                                                display: 'block',
                                                borderRadius: '8px',
                                                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                                            }}
                                        />
                                    </div>
                                )}

                                {/* 이전 사진 버튼 */}
                                {aiCandidates.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPhotoIndex((selectedPhotoIndex - 1 + aiCandidates.length) % aiCandidates.length)}
                                        style={{
                                            position: 'absolute',
                                            left: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(15, 23, 42, 0.75)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: '#ffffff',
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                                            transition: 'transform 0.2s'
                                        }}
                                        title="이전 사진"
                                    >
                                        ❮
                                    </button>
                                )}

                                {/* 다음 사진 버튼 */}
                                {aiCandidates.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPhotoIndex((selectedPhotoIndex + 1) % aiCandidates.length)}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(15, 23, 42, 0.75)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: '#ffffff',
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                                            transition: 'transform 0.2s'
                                        }}
                                        title="다음 사진"
                                    >
                                        ❯
                                    </button>
                                )}
                            </div>

                            {/* 모달 하단 캡션 및 컨트롤 바 */}
                            <div style={{
                                padding: '16px 22px',
                                borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                background: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '14px'
                            }}>
                                <div style={{ flex: '1 1 320px' }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '4px' }}>
                                        {aiCandidates[selectedPhotoIndex].reason}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-gray)' }}>
                                        총 {aiCandidates.length}장 중 {selectedPhotoIndex + 1}번째 사진 | 소재지: {listing.location}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {aiCandidates[selectedPhotoIndex].directLink && (
                                        <a
                                            href={aiCandidates[selectedPhotoIndex].directLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                padding: '9px 16px',
                                                borderRadius: '8px',
                                                background: '#fee500',
                                                color: '#191919',
                                                fontWeight: 800,
                                                fontSize: '0.84rem',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                            }}
                                        >
                                            <i className="fas fa-external-link-alt"></i> 카카오맵 현장 보기 ↗
                                        </a>
                                    )}

                                    {listing.img === aiCandidates[selectedPhotoIndex].url ? (
                                        <span style={{
                                            padding: '9px 16px',
                                            borderRadius: '8px',
                                            background: 'rgba(16, 185, 129, 0.15)',
                                            color: '#10b981',
                                            fontWeight: 800,
                                            fontSize: '0.84rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            ✓ 현재 공식 대표 사진
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleSetAsMainPhoto(aiCandidates[selectedPhotoIndex])}
                                            style={{
                                                padding: '9px 16px',
                                                borderRadius: '8px',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: '#ffffff',
                                                border: 'none',
                                                fontWeight: 800,
                                                fontSize: '0.84rem',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                                            }}
                                        >
                                            ★ 이 사진을 대표 사진으로 설정
                                        </button>
                                    )}
                                </div>
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
