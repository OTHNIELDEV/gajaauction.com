import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const ServicesPage = () => {
    const services = [
        {
            id: 1,
            title: "NPL 투자 컨설팅",
            en: "NPL Investment Consulting",
            icon: "fa-chart-line",
            desc: "금융기관의 부실채권을 매입하여 높은 수익률을 창출하는 전문 투자 컨설팅입니다.",
            details: [
                "1금융권 담보부 부실채권 매입 구조 설계",
                "질권 대출을 활용한 레버리지 극대화 전략",
                "예상 배당표 작성을 통한 정밀한 수익 분석",
                "유입(직접 낙찰) 후 매각 시나리오 플래닝"
            ]
        },
        {
            id: 2,
            title: "경매 권리 분석",
            en: "Auction Rights Analysis",
            icon: "fa-gavel",
            desc: "복잡한 법적 관계를 명쾌하게 해석하고, 입찰부터 명도까지 완벽하게 케어합니다.",
            details: [
                "유치권, 법정지상권 등 특수물건 심층 분석",
                "말소기준권리 및 임차인 대항력 정밀 진단",
                "현장 임장(Field Survey) 리포트 제공",
                "명도 소송 및 점유 이전 협상 대행"
            ]
        },
        {
            id: 3,
            title: "AI 빅데이터 리포트",
            en: "AI Big Data Report",
            icon: "fa-robot",
            desc: "대한민국 부동산 시장의 거대한 데이터를 AI가 분석하여 최적의 타이밍을 포착합니다.",
            details: [
                "지역별 낙찰가율 및 경쟁률 추이 예측",
                "개발 호재 및 GTX 등 교통망 변화 분석",
                "유사 물건 실거래가 비교 데이터 제공",
                "리스크 요인(공실률, 상권 쇠퇴 등) 사전 감지"
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <div className="services-page" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <SEO title="Services" description="NPL 투자 컨설팅" />

            <main style={{ paddingBottom: '100px' }}>
                <section className="page-header text-center" style={{ padding: '80px 0 60px' }}>
                    <div className="container">
                        <motion.span
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="text-gold" style={{ letterSpacing: '3px', fontWeight: '600', display: 'block', marginBottom: '15px' }}>
                            OUR EXPERTISE
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: '"Playfair Display", serif', marginBottom: '20px', color: 'white' }}>
                            World Class Financial Solutions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            style={{ maxWidth: '600px', margin: '0 auto', color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                            가자경매NPL컨설팅은 데이터와 경험이 결합된<br />최상의 솔루션을 제공합니다.
                        </motion.p>
                    </div>
                </section>

                <div className="container">
                    <motion.div
                        className="services-list"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ display: 'grid', gap: '40px' }}
                    >
                        {services.map((service) => (
                            <motion.div
                                key={service.id}
                                variants={itemVariants}
                                className="glass-card"
                                style={{
                                    padding: '50px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '40px',
                                    alignItems: 'center'
                                }}
                            >
                                <div className="service-icon-side" style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '100px', height: '100px',
                                        background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2.5rem', color: '#000', margin: '0 auto 30px',
                                        boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)'
                                    }}>
                                        <i className={`fas ${service.icon}`}></i>
                                    </div>
                                    <h3 style={{ fontSize: '1.8rem', marginBottom: '10px', color: 'white' }}>{service.title}</h3>
                                    <span style={{ color: 'var(--accent-gold)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>{service.en}</span>
                                </div>

                                <div className="service-info-side">
                                    <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '30px', color: 'white' }}>{service.desc}</p>
                                    <h4 style={{ marginBottom: '20px', fontSize: '1.1rem', borderLeft: '3px solid var(--accent-gold)', paddingLeft: '15px', color: 'white' }}>Key Deliverables</h4>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {service.details.map((detail, idx) => (
                                            <li key={idx} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center' }}>
                                                <i className="fas fa-check" style={{ color: 'var(--accent-gold)', marginRight: '15px', fontSize: '0.8rem' }}></i>
                                                <span style={{ color: 'rgba(255,255,255,0.9)' }}>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ServicesPage;
