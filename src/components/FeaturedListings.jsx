import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataManager from '../utils/DataManager';
import AiAssetImageMatcher from '../utils/AiAssetImageMatcher';
import './FeaturedListings.css';

const FeaturedListings = () => {
    const [listings, setListings] = useState([]);

    const loadLatestListings = () => {
        try {
            const allListings = DataManager.getListings();
            if (Array.isArray(allListings) && allListings.length > 0) {
                // 최신 등록 상위 3개 매물 추출
                setListings(allListings.slice(0, 3));
            }
        } catch (error) {
            console.error('[FeaturedListings] Failed to load listings:', error);
        }
    };

    useEffect(() => {
        // 1. 초기 데이터 로드
        loadLatestListings();

        // 2. 다른 탭이나 창에서 매물 추가/수정 시 실시간 동기화
        const handleStorageChange = (e) => {
            if (e.key === 'gaja_listings' || !e.key) {
                loadLatestListings();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // 3. 같은 창 내부 커스텀 이벤트 감지
        const handleCustomUpdate = () => {
            loadLatestListings();
        };
        window.addEventListener('gaja_listings_updated', handleCustomUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('gaja_listings_updated', handleCustomUpdate);
        };
    }, []);

    // 이미지 안전 추출
    const getCardImage = (item) => {
        if (item.img && !item.img.includes('placeholder')) return item.img;
        if (item.imageUrl) return item.imageUrl;
        return AiAssetImageMatcher.getImage(item);
    };

    // 지역 축약 (예: "부산 해운대구 마린시티2로 33" -> "부산 해운대")
    const getShortLocation = (locStr) => {
        if (!locStr) return '대한민국';
        const parts = locStr.trim().split(/\s+/);
        if (parts.length >= 2) {
            return `${parts[0]} ${parts[1].replace(/구$/, '')}`;
        }
        return parts[0] || '대한민국';
    };

    return (
        <section id="listings" className="featured-listings-section">
            <div className="container">
                <div className="featured-header-wrap">
                    <div className="featured-live-pill">
                        <span className="featured-live-dot" />
                        <span>Live Database · 실시간 연동 매물</span>
                    </div>
                    <h2 className="featured-title">Premium Listings</h2>
                    <p className="featured-subtitle">
                        엄선된 가자에셋만의 독점 자산 및 ExitWise AI 분석 프리미엄 매물입니다.
                    </p>
                </div>

                <div className="featured-grid">
                    {listings.map((item) => {
                        const isExitwise = item.isExitwiseLinked || item.source === 'exitwise.io' || String(item.id).startsWith('exitwise-');
                        const isNpl = item.type === 'npl' || item.category === 'NPL' || item.category === '부실채권';
                        const isAuction = item.type === 'auction' || item.category === '경매';
                        
                        const primaryPrice = item.salePrice || item.targetPrice || item.nplTargetPrice || (item.minPrice ? `최저 ${item.minPrice}` : '협의');
                        const secondaryMetricLabel = isNpl ? '채권최고액' : isAuction ? '감정가' : '수익률 (Cap Rate)';
                        const secondaryMetricValue = isNpl 
                            ? (item.claimMax || item.exitwiseData?.keyMetrics?.claimMax || '1,850억') 
                            : isAuction 
                            ? (item.appraisal || item.salePrice || '150억') 
                            : (item.roi || item.exitwiseData?.capRate || '5.8%');

                        const pricePerPyung = item.pricePerPyung ? `평당 ${item.pricePerPyung}` : (item.rate ? `할인율 ${item.rate}` : '프라임급');

                        return (
                            <Link 
                                to={`/listings/${item.id}`} 
                                className="featured-card" 
                                key={item.id}
                                title={`${item.title} 상세 분석 리포트 보기`}
                            >
                                <div className="featured-media">
                                    <img 
                                        src={getCardImage(item)} 
                                        alt={item.title} 
                                        className="featured-img" 
                                        loading="lazy" 
                                    />
                                    <div className="featured-media-overlay" />
                                    <div className="featured-media-badges">
                                        <div className="featured-badges-left">
                                            <span className="featured-badge-loc">
                                                <i className="fas fa-map-marker-alt" style={{ marginRight: '4px', opacity: 0.8 }} />
                                                {getShortLocation(item.location)}
                                            </span>
                                            <span className="featured-badge-cat">
                                                {item.category || (isNpl ? 'NPL' : '오피스')}
                                            </span>
                                        </div>
                                        {isExitwise && (
                                            <span className="featured-badge-ew" title="ExitWise AI 종합 출구전략 및 매각 IM 연동 자산">
                                                <i className="fas fa-bolt" style={{ color: '#fbbf24' }} /> ExitWise IM
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="featured-body">
                                    <h3 className="featured-item-title">
                                        {item.title}
                                    </h3>

                                    <div className="featured-metrics">
                                        <div className="featured-metric-col">
                                            <span className="featured-metric-label">
                                                {isNpl ? '매각 희망가' : isAuction ? '최저 입찰가' : '매각 희망가'}
                                            </span>
                                            <span className="featured-metric-val highlight">
                                                {primaryPrice}
                                            </span>
                                        </div>
                                        <div className="featured-metric-col">
                                            <span className="featured-metric-label">
                                                {secondaryMetricLabel}
                                            </span>
                                            <span className="featured-metric-val">
                                                {secondaryMetricValue}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="featured-footer">
                                        <span className="featured-type-tag">
                                            {pricePerPyung}
                                        </span>
                                        <span className="featured-footer-action">
                                            <span>상세 리포트</span>
                                            <i className="fas fa-arrow-right" style={{ fontSize: '0.8rem' }} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="featured-center-btn">
                    <Link to="/listings" className="featured-viewall-btn">
                        <span>전체 프리미엄 매물 둘러보기</span>
                        <i className="fas fa-arrow-right" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedListings;
