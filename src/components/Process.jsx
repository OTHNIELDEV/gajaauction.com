import React from 'react';
import { motion } from 'framer-motion';

const Process = () => {
    return (
        <section id="process" className="process">
            <div className="container">
                <div className="section-header">
                    <span className="sub-title">THE PROCESS</span>
                    <h2>성공을 위한 <span className="text-gold">5단계 투자 솔루션</span></h2>
                    <p>가자경매만의 체계적인 시스템으로 안전하고 확실한 수익을 만듭니다.</p>
                </div>
                <div className="process-steps">
                    {[
                        { num: "01", title: "1:1 시크릿 상담", desc: "고객 성향 및 자금 규모 심층 분석" },
                        { num: "02", title: "AI 유망 물건 추천", desc: "빅데이터가 선별한 최적 매물 제안" },
                        { num: "03", title: "권리 분석 & 답사", desc: "전문가 팀의 철저한 리스크 검증" },
                        { num: "04", title: "전략적 입찰 & 낙찰", desc: "최적의 입찰가 산정 및 낙찰 성공" },
                        { num: "05", title: "명도 & 수익 실현", desc: "신속한 명도 완료 및 매각/임대 세팅" }
                    ].map((step, index) => (
                        <React.Fragment key={index}>
                            <motion.div
                                className="step-item"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <div className="step-num">{step.num}</div>
                                <div className="step-content">
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                </div>
                            </motion.div>
                            {index < 4 && <div className="step-line"></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Process;
