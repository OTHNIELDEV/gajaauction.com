import React, { useState } from 'react';

const AITech = ({ onSearch }) => {
    const [inputVal, setInputVal] = useState("");

    const handleSearch = () => {
        if (inputVal.trim()) {
            onSearch(inputVal);
        } else {
            alert("사건번호 또는 주소를 입력해주세요.");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <section className="ai-tech">
            <div className="container">
                <div className="ai-content">
                    <div className="ai-text">
                        <span className="sub-title text-gold">CORE TECHNOLOGY</span>
                        <h2>G-RAS System<br /><span className="text-off-white">가자 권리분석 시스템</span></h2>
                        <p>특허받은 AI 알고리즘이 3,000만 건의 부동산 데이터를 실시간으로 분석합니다.</p>
                        <ul className="ai-features">
                            <li>
                                <i className="fas fa-database text-gold"></i>
                                <div>
                                    <h4>빅데이터 마이닝</h4>
                                    <p>전국 법원 경매 정보 및 실거래가 자동 수집</p>
                                </div>
                            </li>
                            <li>
                                <i className="fas fa-brain text-gold"></i>
                                <div>
                                    <h4>낙찰가 예측 모델</h4>
                                    <p>경쟁률 및 최적 입찰가 95% 정확도 예측</p>
                                </div>
                            </li>
                            <li>
                                <i className="fas fa-shield-alt text-gold"></i>
                                <div>
                                    <h4>리스크 필터링</h4>
                                    <p>특수 권리 및 위장 임차인 자동 탐지</p>
                                </div>
                            </li>
                        </ul>
                        <div className="ai-search-box fade-in-up delay-2">
                            <div className="search-input-wrapper">
                                <i className="fas fa-search search-icon"></i>
                                <input
                                    type="text"
                                    placeholder="사건번호 (2025타경1234) 또는 주소 입력"
                                    value={inputVal}
                                    onChange={(e) => setInputVal(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button className="btn-primary" onClick={handleSearch}>무료 권리분석</button>
                            </div>
                        </div>
                    </div>
                    <div className="ai-visual fade-in-up">
                        <div className="visual-box">
                            <div className="scan-line"></div>
                            <div className="data-points">
                                <span></span><span></span><span></span>
                                <span></span><span></span><span></span>
                            </div>
                            <div className="visual-text">AI ANALYZING...</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AITech;
