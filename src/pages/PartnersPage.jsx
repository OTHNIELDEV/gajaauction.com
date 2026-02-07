import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SEO from '../components/SEO';
import DataManager from '../utils/DataManager';

const PartnersPage = () => {
    const [filter, setFilter] = useState("All");
    const [partnersList, setPartnersList] = useState([]);

    useEffect(() => {
        DataManager.init();
        setPartnersList(DataManager.getPartners());
    }, []);

    const categories = ["All", ...new Set(partnersList.map(p => p.category))];

    const filteredPartners = filter === "All"
        ? partnersList
        : partnersList.filter(p => p.category === filter);

    return (
        <div className="partners-page" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <SEO title="Partners" description="가자경매NPL컨설팅 파트너사 소개" />

            <div className="container" style={{ paddingBottom: '100px' }}>
                <section className="page-header text-center" style={{ padding: '80px 0 60px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ fontSize: '3rem', fontFamily: '"Playfair Display", serif', marginBottom: '20px', color: 'white' }}
                    >
                        Our Trusted Partners
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{ maxWidth: '600px', margin: '0 auto', color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}
                    >
                        최고의 전문가들과 함께 고객님의 성공적인 투자를 지원합니다.
                    </motion.p>
                </section>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '60px', flexWrap: 'wrap' }}>
                    {categories.map((cat, index) => (
                        <button
                            key={index}
                            onClick={() => setFilter(cat)}
                            style={{
                                padding: '10px 25px',
                                background: filter === cat ? 'var(--accent-gold-gradient)' : 'rgba(255,255,255,0.05)',
                                color: filter === cat ? '#000' : 'var(--text-gray)',
                                border: filter === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '30px',
                                fontSize: '0.9rem',
                                fontWeight: filter === cat ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Partners Grid */}
                <motion.div
                    layout
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '30px'
                    }}
                >
                    {filteredPartners.map((partner) => (
                        <motion.a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            layout
                            key={partner.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card"
                            style={{
                                padding: '40px 30px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '20px',
                                textDecoration: 'none',
                                display: 'block', // Ensure it behaves like a card
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>
                                <FontAwesomeIcon icon={partner.icon} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', marginBottom: '5px', color: 'white' }}>{partner.nameKo}</h3>
                                <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>{partner.category}</span>
                            </div>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-gray)', lineHeight: '1.6' }}>{partner.description}</p>
                        </motion.a>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default PartnersPage;
