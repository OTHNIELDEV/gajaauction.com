import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero = ({ onConsultingClick }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <header className="hero" ref={ref} style={{ overflow: 'hidden' }}>
            <motion.div
                className="hero-overlay"
                style={{ y: backgroundY }}
            ></motion.div>
            <div className="container hero-content">
                <motion.div style={{ y: textY, opacity }}>
                    <motion.h1
                        className="fade-in-up"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Prestige Investment,<br /><span className="text-gold">Powered by AI</span>
                    </motion.h1>
                    <motion.p
                        className="fade-in-up delay-1"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        빅데이터로 분석하고, 전문가의 눈으로 검증합니다.<br />당신의 자산을 위한 최적의 NPL 옥션 솔루션.
                    </motion.p>
                    <motion.div
                        className="hero-btns fade-in-up delay-2"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <a href="#contact" className="btn-primary" onClick={onConsultingClick}>시크릿 컨설팅 신청</a>
                        <a href="#listings" className="btn-outline">프리미엄 물건</a>
                    </motion.div>
                </motion.div>
            </div>
        </header>
    );
};

export default Hero;
