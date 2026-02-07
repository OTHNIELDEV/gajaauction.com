import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { YieldCalculator } from '../components/calculator/YieldCalculator';
import { WealthSimulator } from '../components/calculator/WealthSimulator';
import { TrustBadge } from '../components/trust/TrustBadge';
import SEO from '../components/SEO';
import DataManager from '../utils/DataManager';

const parseKoreanCurrency = (str) => {
    if (!str) return 0;
    const cleanStr = str.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    if (str.includes('억')) return num * 100000000;
    return num;
};

const ListingDetailPage = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const { openConsulting } = useOutletContext();

    useEffect(() => {
        window.scrollTo(0, 0);
        DataManager.init();
        const found = DataManager.getListingById(id);
        if (found) {
            setListing(found);
        }
    }, [id]);

    if (!listing) {
        return (
            <div style={{ padding: '200px', textAlign: 'center', color: 'white' }}>
                <h2>매물을 찾을 수 없습니다.</h2>
                <Link to="/listings" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>목록으로 돌아가기</Link>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'analysis', label: 'Investment Analysis' },
        { id: 'location', label: 'Location' }
    ];

    return (
        <div className="listing-detail-page" style={{ background: 'var(--primary-navy)', minHeight: '100vh', color: 'var(--text-off-white)' }}>
            <SEO title={listing.title} description={`${listing.location}에 위치한 프리미엄 물건입니다. 감정가 ${listing.appraisal}`} />

            {/* Hero Section */}
            <section style={{ height: '60vh', position: 'relative', overflow: 'hidden' }}>
                <motion.div
                    initial={{ scale: 1.1 }}
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
                        opacity: 0.6
                    }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to top, var(--primary-navy), transparent)' }} />

                <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '60px' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <span className="badge">{listing.category}</span>
                            <TrustBadge />
                        </div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>{listing.title}</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-gray)' }}><i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-gold)', marginRight: '10px' }}></i>{listing.location}</p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section style={{ padding: '60px 0 150px' }}>
                <div className="container">
                    <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                        {/* Left: Main Info */}
                        <div style={{ flex: 2, minWidth: '300px' }}>
                            {/* Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px' }}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            padding: '15px 30px',
                                            fontSize: '1.1rem',
                                            color: activeTab === tab.id ? 'var(--accent-gold)' : 'var(--text-gray)',
                                            borderBottom: activeTab === tab.id ? '2px solid var(--accent-gold)' : '2px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {activeTab === 'overview' && (
                                        <div className="glass-card" style={{ padding: '40px' }}>
                                            <h3 style={{ marginBottom: '30px', borderLeft: '3px solid var(--accent-gold)', paddingLeft: '15px' }}>기본 정보</h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                                <InfoItem label="감정가" value={listing.appraisal} icon="fa-balance-scale" />
                                                <InfoItem label="최저가" value={listing.minPrice} highlight icon="fa-tag" />
                                                <InfoItem label="낙찰가율(예상)" value={listing.rate} icon="fa-chart-pie" />
                                                <InfoItem label="용도" value={listing.category} icon="fa-building" />
                                            </div>
                                            <div style={{ marginTop: '40px', lineHeight: '1.8', color: 'var(--text-gray)' }}>
                                                <p>본 물건은 {listing.location} 핵심 입지에 위치한 우량 자산입니다. 현재 NPL 매입을 통한 입찰 시 시세 대비 탁월한 가격 경쟁력을 확보할 수 있으며, 향후 {listing.category === '토지' ? '개발 가능성' : '임대 수익률'} 또한 매우 높게 평가됩니다.</p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'analysis' && (
                                        <div>
                                            <YieldCalculator
                                                appraisalPrice={parseKoreanCurrency(listing.appraisal)}
                                                minPrice={parseKoreanCurrency(listing.minPrice)}
                                            />

                                            <WealthSimulator
                                                initialInvestment={parseKoreanCurrency(listing.minPrice)}
                                                growthRate={8.5} // Mock growth rate
                                            />

                                            <div className="glass-card" style={{ padding: '30px', marginTop: '20px' }}>
                                                <h3 style={{ marginBottom: '20px', color: 'var(--accent-gold)' }}>
                                                    <i className="fas fa-file-alt"></i> AI 리포트 자동 생성
                                                </h3>
                                                <p style={{ color: '#ccc', marginBottom: '20px' }}>
                                                    빅데이터 및 등기 권리 분석을 기반으로 AI가 생성한 프리미엄 리포트를 확인하세요.
                                                </p>
                                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold' }}>{listing.title} - 정밀 분석 리포트.pdf</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Generated by GAJA AI • 2.4MB</div>
                                                    </div>
                                                    <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i className="fas fa-download"></i> 다운로드
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'location' && (
                                        <div className="glass-card" style={{ padding: '40px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <i className="fas fa-map-marked-alt" style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '20px' }}></i>
                                                <p>상세 주소 및 지도는<br />보안상 <strong>컨설팅 신청 고객</strong>에게만 제공됩니다.</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right: Sticky Sidebar */}
                        <div style={{ flex: 1, minWidth: '300px', position: 'sticky', top: '100px' }}>
                            <div className="glass-card" style={{ padding: '30px', border: '1px solid var(--accent-gold)' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>관심이 생기셨나요?</h3>
                                <p style={{ color: 'var(--text-gray)', marginBottom: '30px', fontSize: '0.95rem' }}>전문 컨설턴트가 상세 리포트를 준비해 드립니다.</p>

                                <ul style={{ marginBottom: '30px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                                    <li style={{ marginBottom: '10px' }}><i className="fas fa-check" style={{ color: 'var(--accent-gold)', marginRight: '10px' }}></i>정밀 권리 분석 보고서</li>
                                    <li style={{ marginBottom: '10px' }}><i className="fas fa-check" style={{ color: 'var(--accent-gold)', marginRight: '10px' }}></i>예상 배당표 및 수익률표</li>
                                    <li style={{ marginBottom: '10px' }}><i className="fas fa-check" style={{ color: 'var(--accent-gold)', marginRight: '10px' }}></i>입찰가 산정 가이드</li>
                                </ul>

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', borderRadius: '8px' }}
                                    onClick={openConsulting}
                                >
                                    상담 신청하기
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: 'var(--text-gray)' }}>
                                    <i className="fas fa-phone-alt" style={{ marginRight: '5px' }}></i> 02-1234-5678
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

const InfoItem = ({ label, value, highlight, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', color: 'var(--accent-gold)' }}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: highlight ? 'var(--accent-gold)' : 'white' }}>{value}</div>
        </div>
    </div>
);

export default ListingDetailPage;
