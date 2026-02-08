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

                {/* CEO Detailed Profile (Education & Career) */}
                <section style={{ padding: '80px 0', background: 'var(--bg-dark)' }}>
                    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px' }}>
                        {/* Education */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={itemVariants}
                        >
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '30px', color: 'var(--accent-gold)', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '10px' }}>
                                Education
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '20px' }}>
                                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#fff' }}>Seoul National University</strong>
                                    <span style={{ color: 'var(--text-gray)' }}>Graduated (1998)</span>
                                </li>
                                <li style={{ marginBottom: '20px' }}>
                                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#fff' }}>Konkuk University Graduate School</strong>
                                    <span style={{ color: 'var(--text-gray)' }}>Master's Degree in Real Estate Management</span>
                                </li>
                                <li>
                                    <strong style={{ display: 'block', fontSize: '1.2rem', color: '#fff' }}>Korea Creative Content Agency (KOCCA)</strong>
                                    <span style={{ color: 'var(--text-gray)' }}>Global Marketing & Advanced CEO Program Completed</span>
                                </li>
                            </ul>
                        </motion.div>

                        {/* Career */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={itemVariants}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '30px', color: 'var(--accent-gold)', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '10px' }}>
                                Professional Career
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '15px', color: '#fff' }}>
                                    <span style={{ color: 'var(--accent-gold)', marginRight: '10px' }}>Present</span>
                                    CEO, NBit Korea Co., Ltd. (2018 – Present)
                                </li>
                                <li style={{ marginBottom: '15px', color: 'var(--text-gray)' }}>
                                    Founder & CEO of OAS Blockchain
                                </li>
                                <li style={{ marginBottom: '15px', color: 'var(--text-gray)' }}>
                                    Former CEO, AXA Soft / CastCity
                                </li>
                                <li style={{ marginBottom: '15px', color: 'var(--text-gray)' }}>
                                    Former Producer (PD), Samsung Unitel
                                </li>
                                <li style={{ color: 'var(--text-gray)' }}>
                                    Established multiple IT ventures (Blockchain, IoT, AI)
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </section>

                {/* History & Milestones */}
                <section style={{ padding: '100px 0', background: 'linear-gradient(to bottom, var(--bg-dark), #0a1120)' }}>
                    <div className="container">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={containerVariants}
                            style={{ textAlign: 'center', marginBottom: '80px' }}
                        >
                            <span className="text-gold" style={{ letterSpacing: '3px', fontWeight: 'bold' }}>SINCE 2008</span>
                            <h2 style={{ fontSize: '3rem', marginTop: '10px', fontFamily: '"Playfair Display", serif' }}>History of Excellence</h2>
                            <p style={{ color: 'var(--text-gray)', maxWidth: '600px', margin: '20px auto' }}>
                                IT 기술력과 부동산 전문성의 융합으로 걸어온 혁신의 발자취입니다.
                            </p>
                        </motion.div>

                        <div className="history-timeline" style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', paddingLeft: '30px', borderLeft: '2px solid rgba(212, 175, 55, 0.3)' }}>
                            {[
                                { year: '2024', title: 'Start of Gaja Auction NPL', desc: '가자경매 NPL 컨설팅 플랫폼 런칭 (AI & Blockchain Integration)' },
                                { year: '2022', title: 'Blockchain Security Patents', desc: '블록체인 기반 안전 결제 및 중재 노드 시스템 특허 등록 (KR/US)' },
                                { year: '2019', title: 'US Patent Acquisition', desc: 'IoT 보안 시스템 미국 특허 취득 (US Patent No. 10,382,205)' },
                                { year: '2018', title: 'NBit Korea Established', desc: '블록체인 및 IoT 보안 전문 기업 NBit Korea 설립' },
                                { year: '2017', title: 'Real Estate Expansion', desc: '가자공인중개사사무소 개설 (성남시 분당구)' },
                                { year: '2008', title: 'Licensed Realtor', desc: '제 19회 공인중개사 자격 취득' },
                                { year: '1998', title: 'Academic Foundation', desc: '서울대학교 졸업' },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{ marginBottom: '50px', position: 'relative' }}
                                >
                                    <div style={{
                                        position: 'absolute', left: '-39px', top: '0',
                                        width: '16px', height: '16px', background: 'var(--accent-gold)',
                                        borderRadius: '50%', border: '4px solid var(--bg-dark)',
                                        boxShadow: '0 0 10px var(--accent-gold)'
                                    }}></div>
                                    <span style={{ fontSize: '2rem', fontWeight: '800', color: 'rgba(255,255,255,0.1)', display: 'block', lineHeight: '1' }}>{item.year}</span>
                                    <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: '5px 0' }}>{item.title}</h3>
                                    <p style={{ color: 'var(--text-gray)' }}>{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Certifications & Patents */}
                <section style={{ padding: '100px 0', background: '#050b14' }}>
                    <div className="container">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={containerVariants}
                            style={{ textAlign: 'center', marginBottom: '60px' }}
                        >
                            <span className="text-gold" style={{ letterSpacing: '3px', fontWeight: 'bold' }}>CREDIBILITY</span>
                            <h2 style={{ fontSize: '3rem', marginTop: '10px', fontFamily: '"Playfair Display", serif' }}>
                                Licenses & Patents
                            </h2>
                            <p style={{ color: 'var(--text-gray)', marginTop: '20px' }}>
                                보유한 <span className="text-gold">7개의 블록체인/AI/IoT 특허</span>와 전문 자격증은<br />
                                가자경매의 기술적 신뢰도와 전문성을 증명합니다.
                            </p>
                        </motion.div>

                        {/* Main Licenses */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                            {[
                                { title: '투자자산운용사', sub: 'Certified Investment Manager', org: '금융투자협회 (2024)' },
                                { title: '공인중개사', sub: 'Licensed Real Estate Agent', org: '국토교통부 (2008)' }
                            ].map((lic, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -10 }}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(212, 175, 55, 0.3)',
                                        padding: '40px',
                                        textAlign: 'center',
                                        borderRadius: '4px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{
                                        border: '1px solid var(--accent-gold)',
                                        width: 'calc(100% - 20px)', height: 'calc(100% - 20px)',
                                        position: 'absolute', top: '10px', left: '10px',
                                        pointerEvents: 'none', opacity: 0.5
                                    }}></div>
                                    <i className="fas fa-certificate" style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '20px' }}></i>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{lic.title}</h3>
                                    <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>{lic.sub}</p>
                                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', fontSize: '0.9rem' }}>
                                        {lic.org}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Patents Grid */}
                        <h3 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--text-light)' }}>
                            <i className="fas fa-shield-alt" style={{ marginRight: '10px', color: 'var(--accent-gold)' }}></i>
                            Global Patents Portfolio (KR & US)
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {[
                                { id: 'US 10,382,205', title: 'Blockchain Security System', desc: 'Security System for Blockchain with Arbitration Server' },
                                { id: 'US 10,346,614', title: 'IoT Security', desc: 'Network Access Control Method for Local Devices' },
                                { id: 'KR 10-2020-0010659', title: 'Secure Payment', desc: 'Secure Payment Method Using Blockchain & Arbitration' },
                                { id: 'KR 10-2020-0018069', title: 'Dispute Resolution', desc: 'Blockchain Secure Payment System Using Arbitration Node' },
                                { id: 'KR 10-0914609', title: 'AI Voice Processing', desc: 'Speech Information Processing Device and Method' },
                                { id: 'KR 10-1835718', title: 'Mobile Auth', desc: 'Mobile Authentication Method Based on Short-Range Wireless' },
                                { id: 'KR 10-2019-0140144', title: 'Privacy Protection', desc: 'Confidential Blockchain Service Using Mediator Server' }
                            ].map((patent, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * idx }}
                                    style={{
                                        background: '#0a1120',
                                        borderRadius: '8px',
                                        padding: '25px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <i className="fas fa-file-contract" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem' }}></i>
                                        <span style={{ fontSize: '0.8rem', color: '#666', border: '1px solid #333', padding: '2px 8px', borderRadius: '4px' }}>
                                            {patent.id.startsWith('US') ? 'US Patent' : 'KR Patent'}
                                        </span>
                                    </div>
                                    <h4 style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: '1.4' }}>{patent.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>{patent.desc}</p>
                                    <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                                        {patent.id}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '60px' }}>
                            <p style={{ color: 'var(--accent-gold)', marginBottom: '10px' }}>
                                <i className="fas fa-info-circle" style={{ marginRight: '5px' }}></i>
                                원본 증빙 서류는 사무실 내방 시 확인 가능합니다.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPage;
