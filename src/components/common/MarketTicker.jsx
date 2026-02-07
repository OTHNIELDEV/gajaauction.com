import React from 'react';
import { motion } from 'framer-motion';

const MarketTicker = () => {
    // Mock Data for ticker
    const newsItems = [
        "🔥 [긴급] 강남 꼬마빌딩 NPL 50억 → 35억 (30% 할인)",
        "📢 [낙찰] 판교 오피스텔 경매 낙찰률 85% 기록",
        "💡 [정보] 2026년 상업용 부동산 NPL 시장 규모 20조원 돌파",
        "⚡ [속보] 해운대 펜트하우스 특별 공매 개시 - 수익률 12% 예상",
        "🏠 [매물] 제주도 타운하우스 통매각 물건 접수 완료"
    ];

    return (
        <div style={{
            background: '#0a0a0a',
            color: '#D4AF37',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            borderBottom: '1px solid #333',
            fontSize: '0.9rem',
            position: 'relative',
            zIndex: 2000 // Above navbar
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <span style={{
                    fontWeight: 'bold',
                    paddingRight: '20px',
                    marginRight: '20px',
                    borderRight: '1px solid #333',
                    whiteSpace: 'nowrap',
                    color: '#fff'
                }}>
                    LIVE NPL MARKET
                </span>
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    <motion.div
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{
                            repeat: Infinity,
                            duration: 30, // Adjust speed
                            ease: "linear"
                        }}
                        style={{ display: 'flex', gap: '50px', whiteSpace: 'nowrap' }}
                    >
                        {[...newsItems, ...newsItems].map((item, index) => (
                            <span key={index}>{item}</span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MarketTicker;
