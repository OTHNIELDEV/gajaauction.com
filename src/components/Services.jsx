import React from 'react';
import { motion } from 'framer-motion';

const Services = () => {
    return (
        <section id="services" className="services">
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>Our Services</h2>
                    <p>AI 기술와 전문가의 통찰력이 만났습니다.</p>
                </motion.div>

                <div className="grid-3">
                    {[
                        { icon: "fa-chart-line", title: "NPL 투자 컨설팅", desc: "부실채권(NPL)의 정확한 가치 평가와 수익률 분석을 통한 안정적인 투자 제안." },
                        { icon: "fa-gavel", title: "경매 권리 분석", desc: "복잡한 권리 관계를 AI와 전문가가 이중으로 검토하여 리스크를 제거합니다." },
                        { icon: "fa-robot", title: "AI 빅데이터 리포트", desc: "전국 부동산 시장 데이터를 분석하여 미래 가치가 높은 물건을 선별 추천합니다." }
                    ].map((service, index) => (
                        <motion.div
                            key={index}
                            className="card glass-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                        >
                            <div className="icon-box">
                                <i className={`fas ${service.icon}`}></i>
                            </div>
                            <h3>{service.title}</h3>
                            <p dangerouslySetInnerHTML={{ __html: service.desc.replace(/\./g, '.<br/>') }}></p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
