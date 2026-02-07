import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIConcierge = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: '안녕하세요! 프리미엄 NPL 투자 컨설턴트, GAJA AI입니다.' },
        { type: 'bot', text: '원하시는 투자 지역이나 금액대를 말씀해 주시면, 최적의 물건을 추천해 드립니다.' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { type: 'user', text: input }]);
        setInput('');

        // Mock Bot Response
        setTimeout(() => {
            const botResponse = `"${input}"에 대한 분석을 시작합니다... 잠시만 기다려주세요. (데모 버전입니다)`;
            setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    bottom: '40px', // Raised slightly from 30px
                    right: '40px', // Moved slightly inward from 30px
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--accent-gold)',
                    border: 'none',
                    boxShadow: '0 5px 15px rgba(212, 175, 55, 0.4)',
                    zIndex: 9999,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#050b14'
                }}
            >
                {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-robot"></i>}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '30px',
                            width: '350px',
                            height: '500px',
                            background: '#0a192f',
                            borderRadius: '15px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            zIndex: 9999,
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '20px', background: 'var(--primary-navy)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fas fa-robot" style={{ color: '#050b14', fontSize: '1.2rem' }}></i>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>GAJA AI Concierge</h3>
                                <div style={{ fontSize: '0.75rem', color: '#4caf50' }}>● Online</div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                    background: msg.type === 'user' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                                    color: msg.type === 'user' ? '#050b14' : '#fff',
                                    padding: '10px 15px',
                                    borderRadius: '10px',
                                    maxWidth: '80%',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#050b14', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="메시지를 입력하세요..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    padding: '10px 15px',
                                    borderRadius: '20px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <button onClick={handleSend} style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '1.2rem', cursor: 'pointer' }}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIConcierge;
