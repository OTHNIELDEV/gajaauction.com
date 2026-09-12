import React from 'react';
import './FilterBar.css';

const FilterBar = ({
    transactionTypes = [
        { key: 'all', label: '전체' },
        { key: 'general', label: '일반매물' },
        { key: 'npl', label: 'NPL' },
        { key: 'auction', label: '경매' }
    ],
    selectedType = 'all',
    onSelectType,
    categories = ["전체", "오피스빌딩", "호텔", "상가", "토지", "아파트/주택"],
    selectedCategory = '전체',
    onSelectCategory,
    counts = {},
    searchTerm = '',
    onSearchChange,
    onClearSearch,
    totalCount = 0,
    onResetAll
}) => {
    const isFiltered = selectedType !== 'all' || selectedCategory !== '전체' || (searchTerm && searchTerm.trim() !== '');

    const getCategoryIcon = (category) => {
        switch (category) {
            case '오피스빌딩':
                return <i className="fas fa-building" style={{ fontSize: '0.8rem' }}></i>;
            case '호텔':
                return <i className="fas fa-hotel" style={{ fontSize: '0.8rem' }}></i>;
            case '상가':
                return <i className="fas fa-store" style={{ fontSize: '0.78rem' }}></i>;
            case '토지':
                return <i className="fas fa-mountain-sun" style={{ fontSize: '0.8rem' }}></i>;
            case '아파트/주택':
                return <i className="fas fa-house" style={{ fontSize: '0.8rem' }}></i>;
            default:
                return null;
        }
    };

    return (
        <div className="filter-hub">
            {/* Top Row: 거래 유형 세그먼트 탭 & 검색 인풋 그룹 */}
            <div className="filter-hub-top">
                {/* 1단계: 세그먼트 컨트롤 탭 */}
                <div className="segmented-tabs" role="tablist" aria-label="거래 유형 선택">
                    {transactionTypes.map((t) => {
                        const isSelected = selectedType === t.key;
                        const count = counts[t.key] !== undefined ? counts[t.key] : null;

                        return (
                            <button
                                key={t.key}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                className={`segmented-tab-btn ${isSelected ? 'active' : ''}`}
                                onClick={() => onSelectType && onSelectType(t.key)}
                            >
                                <span>{t.label}</span>
                                {count !== null && (
                                    <span className="tab-badge">{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 우측: 검색창 및 실시간 건수 뱃지 */}
                <div className="filter-search-group">
                    <div className="filter-search-box">
                        <i className="fas fa-search filter-search-icon"></i>
                        <input
                            type="text"
                            className="filter-search-input"
                            placeholder="매물명, 지역(강남, 판교 등) 검색..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            aria-label="매물 검색"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="filter-search-clear"
                                onClick={() => onClearSearch && onClearSearch()}
                                title="검색어 지우기"
                                aria-label="검색어 지우기"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    <div className="filter-result-count">
                        매물 <strong>{totalCount}</strong>건
                    </div>
                </div>
            </div>

            {/* 중간 디바이더 라인 */}
            <div className="filter-hub-divider" />

            {/* Bottom Row: 자산 용도 칩 필터 & 초기화 버튼 */}
            <div className="filter-hub-bottom">
                <div className="category-chips-list">
                    <span className="category-label">
                        <i className="fas fa-sliders" style={{ fontSize: '0.78rem', color: 'var(--accent-gold)' }}></i>
                        자산 용도
                    </span>
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category;
                        return (
                            <button
                                key={category}
                                type="button"
                                className={`category-chip ${isSelected ? 'active' : ''}`}
                                onClick={() => onSelectCategory && onSelectCategory(category)}
                            >
                                {getCategoryIcon(category)}
                                <span>{category}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 필터가 적용된 경우만 노출되는 초기화 버튼 */}
                {isFiltered && (
                    <button
                        type="button"
                        className="filter-reset-btn"
                        onClick={() => onResetAll && onResetAll()}
                        title="모든 검색 및 필터 초기화"
                    >
                        <i className="fas fa-rotate-left"></i>
                        <span>필터 초기화</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default FilterBar;
