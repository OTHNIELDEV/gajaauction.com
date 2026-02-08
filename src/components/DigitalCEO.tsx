import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ceoImg from '../assets/images/ceo_final.jpg';



const DigitalCEO = () => {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Parallax Effect
    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height, left, top } = currentTarget.getBoundingClientRect();
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;
        setMousePosition({ x, y });
    };

    // Session Management
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        let sid = localStorage.getItem('chat_session_id');
        if (!sid) {
            sid = crypto.randomUUID();
            localStorage.setItem('chat_session_id', sid);
        }
        setSessionId(sid);
    }, []);

    const handleSend = async (arg?: string | React.MouseEvent | KeyboardEvent | null) => {
        let messageText = input;
        if (typeof arg === 'string') {
            messageText = arg;
        }

        if (!messageText.trim()) return;

        // Optimistic UI Update
        const userMsg: { role: 'user' | 'ai', text: string } = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    sessionId: sessionId
                }),
            });

            if (!response.ok) throw new Error('Network error');

            if (!response.body) throw new Error('Response body is null');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            setMessages(prev => [...prev, { role: 'ai', text: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                aiResponse += chunk;

                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].text = aiResponse;
                    return newMsgs;
                });
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', text: "죄송합니다. 연결 상태가 좋지 않습니다. 잠시 후 다시 시도해주세요." }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <section id="about" className="about-ceo" style={{ overflow: 'hidden' }}>
            <div className="container">
                <div className="about-grid">

                    {/* Interactive Avatar Section */}
                    <motion.div
                        className="ceo-image-wrapper"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{ perspective: '1000px', cursor: 'pointer' }}
                        onClick={() => setIsOpen(true)}
                    >
                        <motion.div
                            className="image-frame"
                            animate={{
                                rotateY: mousePosition.x * 10,
                                rotateX: -mousePosition.y * 10,
                            }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                            style={{ position: 'relative' }}
                        >
                            <img src={ceoImg} alt="이상수 대표" className="ceo-img" style={{ display: 'block', width: '100%' }} />

                            {/* "Live" Indicator */}
                            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                                <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 10px #4ade80' }}></div>
                                <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>Digital AI CEO Online</span>
                            </div>

                            {/* CTA Overlay */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                style={{ position: 'absolute', bottom: '30px', left: '50%', x: '-50%', width: '90%', textAlign: 'center' }}
                            >
                                <button className="btn-primary" style={{ padding: '15px 30px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                    <i className="fas fa-comment-dots"></i> 대표에게 직접 질문하기
                                </button>
                            </motion.div>
                        </motion.div>
                        <div className="gold-box"></div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        className="ceo-content"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="section-title">
                            <span className="sub-title">DIGITAL CEO MESSAGE</span>
                            <h2>NPL 투자의 <span className="text-gold">미래</span>,<br />인공지능과 함께 설계합니다.</h2>
                        </div>
                        <div className="message-text">
                            <p>안녕하십니까, <strong>Digital CEO Ideal-Soo</strong>입니다.</p>
                            <p>전통적인 경매 노하우에 최첨단 AI 분석 기술을 더했습니다. 이제 감이 아닌 <strong>데이터</strong>로, 불안이 아닌 <strong>확신</strong>으로 투자하십시오.</p>
                            <p>좌측의 저(Digital Avatar)를 클릭하시면, 24시간 언제든 NPL 투자에 대한 궁금증을 즉시 해결해 드립니다.</p>

                            <div className="tech-specs" style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                                    <i className="fas fa-brain" style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', marginBottom: '10px' }}></i>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>AI Knowledge</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                                    <i className="fas fa-comment-medical" style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', marginBottom: '10px' }}></i>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Real-time Q&A</div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Chat Modal Interface */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="chat-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => setIsOpen(false)}
                        >
                            <motion.div
                                className="chat-box"
                                initial={{ scale: 0.9, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 50 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{ width: '90%', maxWidth: '500px', height: '600px', background: 'var(--primary-navy)', border: '1px solid var(--accent-gold)', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 50px rgba(212,175,55,0.3)' }}
                            >
                                {/* Chat Header */}
                                <div style={{ padding: '20px', background: 'rgba(212,175,55,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ padding: '2px', border: '2px solid var(--accent-gold)', borderRadius: '50%' }}>
                                            <img src={ceoImg} alt="CEO" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Digital CEO</div>
                                            <div style={{ fontSize: '0.8rem', color: '#4ade80' }}>● Online (AI-Powered)</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                                </div>

                                {/* Chat Messages */}
                                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div className="msg-ai" style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '0 15px 15px 15px', color: '#eee', lineHeight: '1.5' }}>
                                            반갑습니다. 가자경매NPL의 디지털 CEO입니다. <br />
                                            NPL 투자에 대해 무엇이든 물어보세요.
                                        </div>
                                    </div>

                                    {messages.map((msg, idx) => (
                                        <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                            <div style={{
                                                background: msg.role === 'user' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                                                color: msg.role === 'user' ? '#000' : '#eee',
                                                padding: '15px',
                                                borderRadius: msg.role === 'user' ? '15px 15px 0 15px' : '0 15px 15px 15px',
                                                lineHeight: '1.5',
                                                fontWeight: msg.role === 'user' ? 'bold' : 'normal'
                                            }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="msg-ai" style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '0 15px 15px 15px', display: 'flex', gap: '5px' }}>
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} style={{ width: '8px', height: '8px', background: '#aaa', borderRadius: '50%' }} />
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '8px', height: '8px', background: '#aaa', borderRadius: '50%' }} />
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '8px', height: '8px', background: '#aaa', borderRadius: '50%' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Area */}
                                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>

                                    {/* Quick Suggestions */}
                                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px', paddingBottom: '5px' }}>
                                        {['NPL이 뭔가요?', '수익률은 어느정도?', '초보다도 가능한가요?'].map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(q)}
                                                style={{ whiteSpace: 'nowrap', padding: '8px 15px', borderRadius: '20px', border: '1px solid #444', background: 'transparent', color: '#ccc', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="질문을 입력하세요..."
                                            style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                                        />
                                        <button
                                            onClick={handleSend}
                                            style={{ padding: '0 20px', borderRadius: '10px', border: 'none', background: 'var(--accent-gold)', color: '#000', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            <i className="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>

                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default DigitalCEO;
