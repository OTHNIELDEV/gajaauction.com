import React from 'react';

const FilterBar = ({ categories, selectedFilter, onSelect }) => {
    return (
        <div className="filter-bar" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '40px', justifyContent: 'center' }}>
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelect(category)}
                    className={`btn-filter ${selectedFilter === category ? 'active' : ''}`}
                    style={{
                        background: selectedFilter === category ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                        color: selectedFilter === category ? '#000' : 'var(--text-gray)',
                        border: '1px solid var(--glass-border)',
                        padding: '10px 25px',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: selectedFilter === category ? '700' : '400',
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
