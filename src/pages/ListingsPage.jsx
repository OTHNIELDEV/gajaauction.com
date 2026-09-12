import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FilterBar from '../components/listings/FilterBar';
import ListingCard from '../components/listings/ListingCard';
import SEO from '../components/SEO';
import { filterCategories, transactionTypes } from '../data/mockListings';
import DataManager from '../utils/DataManager';
import './ListingsPage.css';

const ListingsPage = () => {
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [searchTerm, setSearchTerm] = useState('');
    const [listings, setListings] = useState([]);
    const [showExitWiseBanner, setShowExitWiseBanner] = useState(true);

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

    const handleResetAll = () => {
        setSelectedType('all');
        setSelectedCategory('전체');
        setSearchTerm('');
    };

    return (
        <div className="listings-page">
            <SEO
                title="Exclusive Listings | GAJA ASSET"
                description="가자에셋이 엄선한 오피스빌딩, 특급호텔, NPL(부실채권), 법원경매 프리미엄 투자 포트폴리오를 확인하세요."
            />

            {/* Header Section */}
            <section className="listings-header">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="listings-badge"
                    >
                        <i className="fas fa-crown"></i> Institutional & High-End Assets
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="listings-title"
                    >
                        Exclusive Investment Portfolio
                    </motion.h1>

                    <p className="listings-subtitle">
                        오피스빌딩, 특급호텔, NPL(부실채권), 법원 경매 및 우량 일반매각 물건까지<br />
                        상위 1% 자산가를 위한 가자에셋만의 독점 투자 기회를 만나보세요.
                    </p>

                    {/* ExitWise AI Slim Capsule Notification */}
                    <AnimatePresence>
                        {showExitWiseBanner && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, height: 0, margin: 0, overflow: 'hidden' }}
                                transition={{ duration: 0.25 }}
                                className="exitwise-slim-capsule"
                            >
                                <div className="capsule-content">
                                    <span className="capsule-tag">
                                        <i className="fas fa-bolt"></i> ExitWise AI
                                    </span>
                                    <span className="capsule-text">
                                        실시간 연동: <strong>해운대 그랜드조선 호텔 매각 IM</strong>이 가자에셋에 정상 연동되었습니다.
                                    </span>
                                </div>
                                <div className="capsule-actions">
                                    <Link to="/exitwise-bridge" className="capsule-link">
                                        시뮬레이터 체험 <i className="fas fa-arrow-right"></i>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setShowExitWiseBanner(false)}
                                        className="capsule-close-btn"
                                        aria-label="배너 닫기"
                                        title="배너 닫기"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Listings Content Section */}
            <section className="listings-content" style={{ paddingBottom: '100px' }}>
                <div className="container">
                    {/* Unified Filter Hub (대분류 탭 + 검색창 + 자산용도 칩 + 초기화) */}
                    <FilterBar
                        transactionTypes={transactionTypes}
                        selectedType={selectedType}
                        onSelectType={setSelectedType}
                        categories={filterCategories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        counts={counts}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onClearSearch={() => setSearchTerm('')}
                        totalCount={filteredListings.length}
                        onResetAll={handleResetAll}
                    />

                    {/* Listings Grid */}
                    <motion.div layout className="grid-3" style={{ minHeight: '450px' }}>
                        <AnimatePresence>
                            {filteredListings.map((item) => (
                                <ListingCard key={item.id} item={item} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty State */}
                    {filteredListings.length === 0 && (
                        <div className="listings-empty-state">
                            <i className="fas fa-magnifying-glass empty-state-icon"></i>
                            <h3 className="empty-state-title">선택하신 조건에 일치하는 매물이 없습니다.</h3>
                            <p className="empty-state-desc">
                                다른 거래 유형, 자산 용도를 선택하시거나 검색어를 변경해 보세요.
                            </p>
                            <button
                                type="button"
                                onClick={handleResetAll}
                                style={{
                                    padding: '9px 22px',
                                    background: 'var(--accent-gold)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#050b14',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
                                }}
                            >
                                <i className="fas fa-rotate-left" style={{ marginRight: '6px' }}></i>
                                필터 전체 초기화
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ListingsPage;
