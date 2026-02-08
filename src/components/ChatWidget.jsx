import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '안녕하십니까, 대표 이상수입니다. 전설적인 NPL 투자의 세계로 오신 것을 환영합니다. 무엇을 도와드릴까요?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        console.log('ChatWidget mounted');
        try {
            // Generate or retrieve session ID
            let sid = localStorage.getItem('chat_session_id');
            if (!sid) {
                // Robust UUID generation
                if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                    sid = crypto.randomUUID();
                } else {
                    sid = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
                }
                localStorage.setItem('chat_session_id', sid);
            }
            setSessionId(sid);
        } catch (error) {
            console.error('Error initializing chat session:', error);
            // Fallback for session ID if localStorage fails
            setSessionId('fallback-' + Date.now());
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const formatTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId: sessionId
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            // Add placeholder for streaming
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                aiResponse += chunk;

                // Update the last message with accumulating chunk
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = aiResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '죄송합니다. 현재 연결 상태가 고르지 않아 답변을 드리기 어렵습니다. 잠시 후 다시 시도해 주십시오.'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                className="chat-widget-button"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Chat with CEO"
            >
                {isOpen ? (
                    <i className="fas fa-times" style={{ fontSize: '24px', color: 'white' }}></i>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <i className="fas fa-user-tie" style={{ fontSize: '30px', color: 'white' }}></i>
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', height: '12px', width: '12px' }}>
                            <span className="animate-ping" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#4ade80', opacity: 0.75 }}></span>
                            <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '12px', width: '12px', backgroundColor: '#22c55e' }}></span>
                        </span>
                    </div>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="chat-window"
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-avatar">
                                <i className="fas fa-user-tie" style={{ color: '#eab308' }}></i>
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 'bold', color: 'white', fontSize: '18px' }}>Lee Sang-soo</h3>
                                <p style={{ fontSize: '12px', color: '#eab308', fontWeight: 500 }}>CEO • NPL Expert</p>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Online</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
                                >
                                    <div
                                        className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
                                    >
                                        <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                        <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.5, textAlign: 'right' }}>{formatTime()}</p>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message-row assistant">
                                    <div className="message-bubble assistant typing-indicator">
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="chat-input-area">
                            <form onSubmit={handleSendMessage} className="chat-form">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="NPL 투자에 대해 물어보세요..."
                                    className="chat-input"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="chat-send-btn"
                                >
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                            <p style={{ fontSize: '10px', textAlign: 'center', color: '#6b7280', marginTop: '8px' }}>
                                투자의 최종 책임은 투자자 본인에게 있습니다.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
