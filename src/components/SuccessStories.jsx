import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const Counter = ({ from, to, duration = 2, suffix = '' }) => {
    const nodeRef = useRef();

    // Simple counter implementation as framer-motion useCountUp is not standard
    // We will use a custom effect or simple text for now, but to be robust let's use a simple state approach with inView
    const isInView = useInView(nodeRef, { once: true });

    // For simplicity in this demo without external heavy libs, we render the target value with a simple fade-in
    // Ideally we would use 'react-countup' or similar, but let's stick to standard motion

    return (
        <motion.span
            ref={nodeRef}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
        >
            {to}{suffix}
        </motion.span>
    );
};

const SuccessStories = () => {
    return (
        <section id="success-stories" className="success-stories">
            <div className="container">
                <div className="section-header center-text">
                    <span className="sub-title">SUCCESS STORIES</span>
                    <h2>숫자로 증명하는 <span className="text-gold">압도적 성과</span></h2>
                    <p>가자경매의 전략적 투자가 만들어낸 실제 수익 사례입니다.</p>
                </div>

                <div className="stories-grid">
                    {[
                        { num: "01", title: "강남 빌딩 NPL 엑시트", Period: "1년 6개월", Return: "150", Suffix: "%", desc: "복잡한 유치권 문제를 법적 대응과 협상으로 해결하여 감정가 대비 60% 낙찰, 리모델링 후 2.5배 가격으로 매각 성공." },
                        { num: "02", title: "저평가 아파트 대량 매입", Period: "8개월", Return: "22", Suffix: "억", desc: "AI 데이터 분석으로 GTX 호재 반영 전 저평가 단지 발굴. 경매로 15채 분산 매입 후 시세 상승 시점에 순차적 매도." },
                        { num: "03", title: "공장 부지 용도 변경", Period: "2년", Return: "3", Suffix: "배", desc: "저렴하게 낙찰받은 일반 공장 부지를 지자체 협의를 통해 물류 센터로 용도 변경, 대기업 장기 임대 계약 체결." }
                    ].map((story, index) => (
                        <motion.div
                            key={index}
                            className="story-card"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            whileHover={{ y: -15, transition: { duration: 0.3 } }}
                        >
                            <div className="story-number" style={{ opacity: 0.05, fontSize: '5rem', top: '10px', right: '10px' }}>{story.num}</div>
                            <div className="story-content">
                                <h3>{story.title}</h3>
                                <div className="story-stats">
                                    <div className="s-stat">
                                        <span className="label">투자 기간</span>
                                        <span className="value">{story.Period}</span>
                                    </div>
                                    <div className="s-stat">
                                        <span className="label">{index === 1 ? "시세 차익" : index === 2 ? "자산 가치" : "수익률"}</span>
                                        <span className="value text-gold" style={{ fontSize: '1.5rem' }}>
                                            <Counter from={0} to={story.Return} suffix={story.Suffix} />
                                        </span>
                                    </div>
                                </div>
                                <p className="story-desc">{story.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;
