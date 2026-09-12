import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const FilterBar = ({
    transactionTypes = [
        { key: 'all', label: '전체 매물' },
        { key: 'general', label: '일반매물(급매/매매)' },
        { key: 'npl', label: 'NPL(부실채권)' },
        { key: 'auction', label: '경매 물건' }
    ],
    selectedType = 'all',
    onSelectType,
    categories = ["전체", "오피스빌딩", "호텔", "상가", "토지", "아파트/주택"],
    selectedCategory = '전체',
    onSelectCategory,
    counts = {}
}) => {
    const { isDark } = useTheme();

    return (
        <div className="filter-bar-container" style={{ marginBottom: '45px' }}>
            {/* 1단계: 거래 유형 (대분류 탭) */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '20px'
            }}>
                {transactionTypes.map((t) => {
                    const isSelected = selectedType === t.key;
                    const count = counts[t.key] !== undefined ? counts[t.key] : null;

                    return (
                        <button
                            key={t.key}
                            onClick={() => onSelectType && onSelectType(t.key)}
                            style={{
                                background: isSelected ? 'var(--accent-gold)' : (isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff'),
                                color: isSelected ? '#000' : 'var(--text-off-white)',
                                border: isSelected ? '1px solid var(--accent-gold)' : (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1'),
                                padding: '12px 28px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1.02rem',
                                fontWeight: isSelected ? '700' : '500',
                                transition: 'all 0.25s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: isSelected ? '0 4px 20px rgba(212, 175, 55, 0.35)' : (isDark ? 'none' : '0 2px 6px rgba(0,0,0,0.04)')
                            }}
                        >
                            <span>{t.label}</span>
                            {count !== null && (
                                <span style={{
                                    fontSize: '0.78rem',
                                    padding: '2px 8px',
                                    borderRadius: '20px',
                                    background: isSelected ? '#000' : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'),
                                    color: isSelected ? 'var(--accent-gold)' : 'var(--text-gray)',
                                    fontWeight: 'bold'
                                }}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 2단계: 자산 용도 (오피스빌딩, 호텔 등 소분류 필터) */}
            <div style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '10px',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginRight: '5px', whiteSpace: 'nowrap' }}>
                    <i className="fas fa-filter" style={{ marginRight: '6px', color: 'var(--accent-gold)' }}></i>자산 용도 :
                </span>
                {categories.map((category) => {
                    const isSelected = selectedCategory === category;
                    const isHighlighted = category === '오피스빌딩' || category === '호텔';

                    return (
                        <button
                            key={category}
                            onClick={() => onSelectCategory && onSelectCategory(category)}
                            style={{
                                background: isSelected
                                    ? (isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.25)')
                                    : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff'),
                                color: isSelected
                                    ? 'var(--accent-gold)'
                                    : isHighlighted
                                        ? (isDark ? '#fff' : '#0f172a')
                                        : 'var(--text-gray)',
                                border: isSelected
                                    ? '1px solid var(--accent-gold)'
                                    : isHighlighted
                                        ? (isDark ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #94a3b8')
                                        : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0'),
                                padding: '8px 18px',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: isSelected || isHighlighted ? '600' : '400',
                                transition: 'all 0.25s ease',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.03)'
                            }}
                        >
                            {category === '오피스빌딩' && <i className="fas fa-building" style={{ fontSize: '0.8rem' }}></i>}
                            {category === '호텔' && <i className="fas fa-hotel" style={{ fontSize: '0.8rem' }}></i>}
                            <span>{category}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterBar;
