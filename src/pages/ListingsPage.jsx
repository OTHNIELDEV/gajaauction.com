import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FilterBar from '../components/listings/FilterBar';
import ListingCard from '../components/listings/ListingCard';
import SEO from '../components/SEO';
import { filterCategories, transactionTypes } from '../data/mockListings';
import DataManager from '../utils/DataManager';

const ListingsPage = () => {
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'priceDesc' | 'priceAsc'
    const [listings, setListings] = useState([]);

    useEffect(() => {
        DataManager.init();
        setListings(DataManager.getListings());
    }, []);

    // 각 거래 유형별 건수 집계
    const counts = {
        all: listings.length,
        general: listings.filter(item => item.type === 'general').length,
        npl: listings.filter(item => item.type === 'npl').length,
        auction: listings.filter(item => item.type === 'auction' || !item.type).length
    };

    // 필터링 처리
    const filteredListings = listings.filter(item => {
        // 1. 거래 유형 필터
        let matchesType = true;
        if (selectedType !== 'all') {
            if (selectedType === 'auction') {
                matchesType = item.type === 'auction' || !item.type;
            } else {
                matchesType = item.type === selectedType;
            }
        }

        // 2. 자산 카테고리 필터 (오피스빌딩, 호텔 등)
        let matchesCategory = true;
        if (selectedCategory !== '전체') {
            if (selectedCategory === '오피스빌딩') {
                matchesCategory = item.category === '오피스빌딩' || item.category === '빌딩/오피스';
            } else if (selectedCategory === '호텔') {
                matchesCategory = item.category === '호텔' || item.category === '호텔/숙박';
            } else {
                matchesCategory = item.category === selectedCategory;
            }
        }

        // 3. 검색어 필터
        let matchesSearch = true;
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            matchesSearch = (item.title || '').toLowerCase().includes(query) ||
                (item.location || '').toLowerCase().includes(query) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)));
        }

        return matchesType && matchesCategory && matchesSearch;
    });

    return (
        <div className="listings-page">
            <SEO
                title="Exclusive Listings | GAJA ASSET"
                description="가자에셋이 엄선한 오피스빌딩, 특급호텔, NPL(부실채권), 법원경매 프리미엄 투자 포트폴리오를 확인하세요."
            />

            {/* Header Section */}
            <section className="listings-header" style={{ paddingTop: '150px', paddingBottom: '40px', textAlign: 'center' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '30px', color: 'var(--accent-gold)', fontSize: '0.88rem', fontWeight: 'bold', marginBottom: '16px' }}
                    >
                        <i className="fas fa-crown"></i> Institutional & High-End Assets
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gold"
                        style={{ fontSize: '2.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}
                    >
                        Exclusive Investment Portfolio
                    </motion.h1>
                    <p style={{ color: 'var(--text-gray)', marginTop: '15px', fontSize: '1.1rem', maxWidth: '750px', margin: '15px auto 0', lineHeight: '1.6' }}>
                        오피스빌딩, 특급호텔, NPL(부실채권), 법원 경매 및 우량 일반매각 물건까지<br />
                        상위 1% 자산가를 위한 가자에셋만의 독점 투자 기회를 만나보세요.
                    </p>

                    {/* ExitWise Integration Banner */}
                    <div style={{
                        marginTop: '30px',
                        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.15))',
                        border: '1px solid rgba(14, 165, 233, 0.35)',
                        borderRadius: '12px',
                        padding: '14px 24px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        maxWidth: '850px',
                        width: '90%',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <i className="fas fa-bolt"></i>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-white)', fontSize: '0.95rem' }}>
                                    ExitWise.io AI IM 연동 시스템 가동 중
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)' }}>
                                    ExitWise IM 스튜디오에서 생성된 [해운대 그랜드조선 호텔 매각 IM]이 가자에셋에 실시간 연동되었습니다.
                                </div>
                            </div>
                        </div>
                        <Link
                            to="/exitwise-bridge"
                            style={{
                                padding: '8px 16px',
                                background: '#0ea5e9',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            연동 시뮬레이터 직접 체험 <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Listings Content Section */}
            <section className="listings-content" style={{ paddingBottom: '120px' }}>
                <div className="container">
                    {/* Filter Bar with Dual Category and Transaction Types */}
                    <FilterBar
                        transactionTypes={transactionTypes}
                        selectedType={selectedType}
                        onSelectType={setSelectedType}
                        categories={filterCategories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        counts={counts}
                    />

                    {/* Search & Meta Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px',
                        flexWrap: 'wrap',
                        gap: '15px'
                    }}>
                        <div style={{ position: 'relative', width: '320px' }}>
                            <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
                            <input
                                type="text"
                                placeholder="매물명, 지역(강남, 해운대 등) 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px 12px 45px',
                                    borderRadius: '10px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--input-text)',
                                    fontSize: '0.92rem',
                                    outline: 'none'
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <div style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>
                            검색 결과: <strong style={{ color: 'var(--accent-gold)' }}>{filteredListings.length}</strong>건의 매물
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <motion.div layout className="grid-3" style={{ minHeight: '500px' }}>
                        <AnimatePresence>
                            {filteredListings.map((item) => (
                                <ListingCard key={item.id} item={item} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty State */}
                    {filteredListings.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            color: 'var(--text-gray)',
                            background: 'var(--card-bg)',
                            borderRadius: '16px',
                            border: '1px dashed var(--glass-border)',
                            marginTop: '20px'
                        }}>
                            <i className="fas fa-search" style={{ fontSize: '2.5rem', color: '#666', marginBottom: '15px' }}></i>
                            <h3 style={{ color: 'var(--text-white)', marginBottom: '8px' }}>선택하신 조건의 매물이 없습니다.</h3>
                            <p style={{ fontSize: '0.95rem', color: '#888' }}>
                                다른 필터 또는 검색어로 다시 시도해 보세요.
                            </p>
                            <button
                                onClick={() => { setSelectedType('all'); setSelectedCategory('전체'); setSearchTerm(''); }}
                                style={{
                                    marginTop: '15px',
                                    padding: '8px 20px',
                                    background: 'var(--accent-gold)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#000',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                필터 초기화
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ListingsPage;
