import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        // Generate or retrieve session ID
        let sid = localStorage.getItem('chat_session_id');
        if (!sid) {
            sid = crypto.randomUUID();
            localStorage.setItem('chat_session_id', sid);
        }
        setSessionId(sid);
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
                className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-lg flex items-center justify-center cursor-pointer border-2 border-yellow-200 hover:scale-110 transition-transform duration-300"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Chat with CEO"
            >
                {isOpen ? (
                    <i className="fas fa-times text-2xl text-white"></i>
                ) : (
                    <div className="relative">
                        <i className="fas fa-user-tie text-3xl text-white"></i>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
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
                        className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[380px] h-[600px] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl bg-gray-900/90 border border-yellow-500/30 shadow-2xl font-sans"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-yellow-500/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50">
                                <i className="fas fa-user-tie text-yellow-500"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Lee Sang-soo</h3>
                                <p className="text-xs text-yellow-500 font-medium">CEO • NPL Expert</p>
                            </div>
                            <div className="ml-auto flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-xs text-gray-400">Online</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-yellow-600/50 scrollbar-track-transparent">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-yellow-600 text-white rounded-tr-none'
                                            : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        <p className="text-[10px] mt-1 opacity-50 text-right">{formatTime()}</p>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-black/20 border-t border-white/5">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="NPL 투자에 대해 물어보세요..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 placeholder-gray-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
                                >
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                            <p className="text-[10px] text-center text-gray-500 mt-2">
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
