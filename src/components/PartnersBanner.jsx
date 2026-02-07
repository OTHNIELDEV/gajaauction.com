import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { partners } from '../data/partners';

const PartnersBanner = () => {
    // Duplicate partners array to create seamless loop
    const marqueePartners = [...partners, ...partners, ...partners];

    return (
        <section className="partners-banner" style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#02060b', overflow: 'hidden' }}>
            <div className="container" style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase' }}>Trusted Partners</h3>
            </div>

            <div className="marquee-container" style={{ display: 'flex', width: '100%', overflow: 'hidden', position: 'relative' }}>
                {/* Gradient masks for fading edges */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to right, #02060b, transparent)', zIndex: 2 }}></div>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to left, #02060b, transparent)', zIndex: 2 }}></div>

                <motion.div
                    className="marquee-track"
                    animate={{ x: [0, -2000] }}
                    transition={{
                        repeat: Infinity,
                        duration: 30,
                        ease: "linear"
                    }}
                    style={{ display: 'flex', gap: '60px', paddingLeft: '40px' }}
                >
                    {marqueePartners.map((partner, index) => (
                        <div key={`${partner.id}-${index}`} className="partner-logo-item" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '200px',
                            opacity: 0.6,
                            filter: 'grayscale(100%)',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.filter = 'grayscale(0%)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0.6';
                                e.currentTarget.style.filter = 'grayscale(100%)';
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-white)' }}>
                                <FontAwesomeIcon icon={partner.icon} />
                            </div>
                            <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-gray)', whiteSpace: 'nowrap' }}>{partner.nameKo}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default PartnersBanner;
