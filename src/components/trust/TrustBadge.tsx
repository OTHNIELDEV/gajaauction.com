import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TrustBadge: React.FC = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <motion.div
                className="trust-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #FFD700 100%)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Holographic Shine Effect */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: -50,
                        width: '20px',
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.6)',
                        transform: 'skewX(-20deg)',
                        filter: 'blur(5px)'
                    }}
                    animate={{ left: '150%' }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                        repeatDelay: 5,
                        ease: "easeInOut"
                    }}
                />

                <i className="fas fa-shield-alt" style={{ color: '#5a4a00', fontSize: '1.2rem' }}></i>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#5a4a00', fontWeight: 'bold', letterSpacing: '1px' }}>BLOCKCHAIN</span>
                    <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: '900' }}>VERIFIED</span>
                </div>
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 9999,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(5px)'
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 50, rotateX: -10 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{
                                width: '90%',
                                maxWidth: '500px',
                                background: 'linear-gradient(145deg, rgba(20, 30, 48, 0.95), rgba(36, 59, 85, 0.95))',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                padding: '30px',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <h3 style={{ color: '#FFD700', fontSize: '1.5rem', marginBottom: '20px', fontFamily: 'Orbitron, sans-serif' }}>
                                <i className="fas fa-link" style={{ marginRight: '10px' }}></i>
                                Digital Integrity Certificate
                            </h3>

                            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#0f0', marginBottom: '20px' }}>
                                <p style={{ margin: '5px 0' }}><span style={{ color: '#aaa' }}>Contract:</span> 0x8f3...a92d</p>
                                <p style={{ margin: '5px 0' }}><span style={{ color: '#aaa' }}>Token ID:</span> #8821</p>
                                <p style={{ margin: '5px 0' }}><span style={{ color: '#aaa' }}>Timestamp:</span> {new Date().toISOString()}</p>
                                <p style={{ margin: '5px 0' }}><span style={{ color: '#aaa' }}>Status:</span> <span style={{ color: '#00ff00' }}>VERIFIED_IMMUTABLE</span></p>
                            </div>

                            <p style={{ color: '#ddd', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '25px' }}>
                                본 권리 분석 보고서는 블록체인 네트워크에 해시값으로 영구 기록되었으며,
                                위변조가 불가능함을 보증합니다.
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                                onClick={() => setShowModal(false)}
                                style={{ width: '100%' }}
                            >
                                확인 완료
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
