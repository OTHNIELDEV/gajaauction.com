import React, { useState, useEffect } from 'react';

const GRASModal = ({ isOpen, onClose, searchTerm }) => {
    const [step, setStep] = useState('loading'); // loading, result
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setStep('loading');
            setLogs([]);
            setProgress(0);

            // Simulation Logic
            const logMessages = [
                "사건번호 식별 중... " + (searchTerm || "2025타경1234"),
                "법원 매각물건명세서 스캔 완료",
                "등기부등본 권리 분석 중 (근저당, 가압류)",
                "인근 실거래가 데이터 15,200건 대조",
                "임차인 대항력 여부 판별...",
                "[완료] G-RAS 분석 리포트 생성"
            ];

            let logIndex = 0;
            const logInterval = setInterval(() => {
                if (logIndex < logMessages.length) {
                    setLogs(prev => [...prev, logMessages[logIndex]]);
                    logIndex++;
                } else {
                    clearInterval(logInterval);
                }
            }, 500);

            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + 2;
                })
            }, 60);

            let timeoutId;
            timeoutId = setTimeout(() => {
                setStep('result');
                clearInterval(logInterval);
                clearInterval(progressInterval);
            }, 3500);

            // Cleanup function
            return () => {
                clearInterval(logInterval);
                clearInterval(progressInterval);
                clearTimeout(timeoutId);
            };
        }
    }, [isOpen, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content glass-card" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <span className="close-modal" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '25px', zIndex: 10 }}>&times;</span>

                <div className="modal-scroll-area" style={{ overflowY: 'auto', width: '100%', paddingRight: '5px' }}>
                    {step === 'loading' ? (
                        <div className="loading-view">
                            <div className="scanner-container">
                                <div className="scanner-circle"></div>
                                <div className="icon-box pulse">
                                    <i className="fas fa-brain"></i>
                                </div>
                            </div>
                            <h3 className="loading-text">G-RAS AI 권리분석 중...</h3>
                            <p className="loading-sub">법원 문건 및 3,000만 건의 데이터와 대조하고 있습니다.</p>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%`, animation: 'none' }}></div>
                            </div>
                            <div className="log-box">
                                {logs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                            </div>
                        </div>
                    ) : (
                        <div className="result-view" style={{ display: 'block' }}>
                            <div className="result-header">
                                <span className="badge" id="resultBadge">PREMIUM REPORT</span>
                                <h2>서울 강남구 역삼동 123-45</h2>
                                <p className="case-info">사건번호: <span>{searchTerm || '2025타경1234'}</span></p>
                            </div>

                            <div className="result-grid">
                                <div className="result-card grade-card">
                                    <h4>종합 투자 등급</h4>
                                    <div className="grade-display">
                                        <span className="grade-circle">A</span>
                                        <div className="grade-desc">
                                            <strong>안전 자산 (Safe)</strong>
                                            <p>권리 관계가 명확하고 입지 분석 결과 상승 여력이 높음</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="result-card">
                                    <h4>G-RAS 예상 낙찰가</h4>
                                    <div className="price-box">
                                        <p className="label">감정평가액</p>
                                        <p className="value-sm">150,000,000,000원</p>
                                        <div className="divider"></div>
                                        <p className="label">AI 적정 입찰가</p>
                                        <p className="value-lg text-gold">105억 ~ 112억</p>
                                    </div>
                                </div>

                                <div className="result-card">
                                    <h4>권리 리스크 분석</h4>
                                    <ul className="risk-list">
                                        <li className="safe"><i className="fas fa-check-circle"></i> 말소기준권리 확정</li>
                                        <li className="safe"><i className="fas fa-check-circle"></i> 선순위 임차인 없음</li>
                                        <li className="warning"><i className="fas fa-exclamation-triangle"></i> 유치권 신고 있으나 성립 가능성 낮음</li>
                                    </ul>
                                </div>

                                <div className="result-card">
                                    <h4>기대 수익률 (Exit)</h4>
                                    <div className="chart-box">
                                        <div className="bar-chart">
                                            <div className="bar-group">
                                                <div className="bar" style={{ height: '60%' }}></div>
                                                <span>낙찰</span>
                                            </div>
                                            <div className="bar-group">
                                                <div className="bar gold" style={{ height: '100%' }}></div>
                                                <span>매각(3년후)</span>
                                            </div>
                                        </div>
                                        <p className="profit-text">예상 차익: <span className="text-gold">+35억</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="consulting-cta">
                                <p>더 상세한 분석과 전문가의 자문이 필요하십니까?</p>
                                <a href="#contact" className="btn-primary" onClick={onClose}>VIP 컨설팅 신청하기</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GRASModal;
