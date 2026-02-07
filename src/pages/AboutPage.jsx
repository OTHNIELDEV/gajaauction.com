import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DigitalCEO from '../components/DigitalCEO';

const AboutPage = ({ onConsultingClick }) => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <div className="about-page" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <main>
                {/* Hero / Intro Section */}
                <section className="about-hero" style={{ padding: '80px 0', textAlign: 'center' }}>
                    <div className="container">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={containerVariants}
                        >
                            <motion.span variants={itemVariants} className="text-gold" style={{
                                display: 'block',
                                fontSize: '1.2rem',
                                letterSpacing: '4px',
                                marginBottom: '20px',
                                fontWeight: '600'
                            }}>
                                ABOUT GAJA AUCTION
                            </motion.span>
                            <motion.h1 variants={itemVariants} style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                lineHeight: '1.2',
                                marginBottom: '40px',
                                fontFamily: '"Playfair Display", serif'
                            }}>
                                "부실채권에는<br />
                                <span className="text-gold">숨겨진 기회</span>가 있습니다."
                            </motion.h1>
                            <motion.p variants={itemVariants} style={{
                                maxWidth: '700px',
                                margin: '0 auto',
                                fontSize: '1.1rem',
                                lineHeight: '1.8',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                단순히 싸게 사는 것이 투자의 전부는 아닙니다.<br />
                                리스크를 해지하고, 가치를 재창조하는 것.<br />
                                그것이 가자경매NPL컨설팅이 정의하는 진정한 투자입니다.
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* CEO Profile Section (Digital Interactive) */}
                <DigitalCEO />
            </main>
        </div>
    );
};

export default AboutPage;
