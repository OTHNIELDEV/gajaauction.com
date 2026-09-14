import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const ListingCard = ({ item }) => {
    const { isDark } = useTheme();
    const isGeneral = item.type === 'general';
    const isNpl = item.type === 'npl';
    const isAuction = item.type === 'auction' || !item.type;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="listing-card"
            style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: item.isExitwiseLinked ? '1px solid rgba(14, 165, 233, 0.4)' : (isDark ? '1px solid var(--glass-border)' : '1px solid #e2e8f0'),
                boxShadow: item.isExitwiseLinked ? '0 10px 30px rgba(14, 165, 233, 0.15)' : (isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.04)'),
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, border-color 0.3s ease'
            }}
        >
            <Link to={`/listings/${item.id}`} style={{ display: 'block', height: '100%', textDecoration: 'none', color: 'inherit' }}>
                {/* Image Container with Badges */}
                <div className="listing-image placeholder-img" style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={item.img}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        alt={item.title}
                    />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

                    {/* Top Badges */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap', zIndex: 2 }}>
                        {/* Transaction Type Badge */}
                        {isGeneral && (
                            <span style={{ background: '#10b981', color: 'white', padding: '4px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                일반매물
                            </span>
                        )}
                        {isNpl && (
                            <span style={{ background: '#a855f7', color: 'white', padding: '4px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                NPL 부실채권
                            </span>
                        )}
                        {isAuction && (
                            <span style={{ background: 'var(--accent-gold)', color: '#000', padding: '4px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                경매
                            </span>
                        )}

                        {/* Category Badge (오피스빌딩, 호텔 강조) */}
                        <span style={{
                            background: item.category === '호텔'
                                ? 'rgba(56, 189, 248, 0.9)'
                                : item.category === '오피스빌딩'
                                    ? 'rgba(99, 102, 241, 0.9)'
                                    : 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            backdropFilter: 'blur(4px)',
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                        }}>
                            {item.category === '호텔' && <i className="fas fa-hotel" style={{ marginRight: '4px' }}></i>}
                            {item.category === '오피스빌딩' && <i className="fas fa-building" style={{ marginRight: '4px' }}></i>}
                            {item.category}
                        </span>
                    </div>

                    {/* ExitWise IM Linked Badge */}
                    {item.isExitwiseLinked && (
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 10px rgba(14, 165, 233, 0.5)',
                            zIndex: 2
                        }}>
                            <i className="fas fa-bolt"></i> ExitWise IM 연동
                        </div>
                    )}

                    {/* Bottom Location overlay */}
                    <div style={{ position: 'absolute', bottom: '10px', left: '12px', color: 'white', fontSize: '0.85rem', zIndex: 2, display: 'flex', alignItems: 'center', gap: '5px', maxWidth: '62%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: 'var(--accent-gold)', flexShrink: 0 }}></i>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.location}</span>
                    </div>

                    {/* Bottom Right: AI Photo Verified Badge */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '12px',
                        background: item.aiPhotoVerification?.selectedSource === 'web_search'
                            ? 'rgba(14, 165, 233, 0.9)'
                            : item.aiPhotoVerification?.selectedSource === 'kakao_skyview'
                            ? 'rgba(168, 85, 247, 0.9)'
                            : 'rgba(16, 185, 129, 0.9)',
                        backdropFilter: 'blur(6px)',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.35)'
                    }}>
                        <span>{item.aiPhotoVerification?.selectedSource === 'web_search' ? '🌐 웹 실사' : item.aiPhotoVerification?.selectedSource === 'kakao_skyview' ? '🛰️ 스카이뷰' : '📷 로드뷰'}</span>
                        <span style={{ opacity: 0.9, fontSize: '0.68rem', fontWeight: 800 }}>{item.aiPhotoVerification?.score || 95}점</span>
                    </div>
                </div>

                {/* Card Info Body */}
                <div className="listing-info" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{
                        fontSize: '1.15rem',
                        fontWeight: '700',
                        color: 'var(--text-white)',
                        marginBottom: '12px',
                        lineHeight: '1.4',
                        height: '2.8em',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {item.title}
                    </h3>

                    {/* Dynamic Pricing Info */}
                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: isDark ? '1px solid var(--glass-border)' : '1px solid #f1f5f9' }}>
                        {isGeneral && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>희망 매매가</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: isDark ? '#10b981' : '#059669' }}>{item.salePrice || item.minPrice}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-off-white)' }}>
                                    <span>예상 수익률</span>
                                    <span style={{ color: isDark ? 'var(--accent-gold)' : '#b8860b', fontWeight: 'bold' }}>{item.roi || '협의'} {item.monthlyRent ? `(월 ${item.monthlyRent})` : ''}</span>
                                </div>
                            </div>
                        )}

                        {isNpl && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>매각 희망가</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: isDark ? '#c084fc' : '#7c3aed' }}>{item.nplTargetPrice || item.salePrice || item.minPrice || '협의'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-off-white)' }}>
                                    <span>채권최고액</span>
                                    <span style={{ color: 'var(--text-gray)' }}>{item.claimMax || item.appraisal || '협의'}{item.rate ? ` (할인율 ${item.rate})` : ''}</span>
                                </div>
                            </div>
                        )}

                        {isAuction && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>최저입찰가</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: isDark ? 'var(--accent-gold)' : '#b8860b' }}>{item.minPrice}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                                    <span>감정가 {item.appraisal}</span>
                                    <span style={{ color: 'var(--text-off-white)' }}>({item.rate})</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Asset Specific Meta Specs */}
                    <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.category === '호텔' && item.exitwiseData?.rooms && (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', padding: '3px 8px', borderRadius: '4px' }}>
                                {item.exitwiseData.rooms}
                            </span>
                        )}
                        {item.specs?.totalFloorArea && (
                            <span style={{ fontSize: '0.78rem', background: 'var(--glass-bg)', color: 'var(--text-gray)', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: '4px' }}>
                                연면적 {item.specs.totalFloorArea}
                            </span>
                        )}
                        {item.tags && item.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} style={{ fontSize: '0.78rem', background: 'var(--glass-bg)', color: 'var(--text-gray)', border: '1px solid var(--glass-border)', padding: '3px 8px', borderRadius: '4px' }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ListingCard;
