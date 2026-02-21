import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" onClick={scrollToTop} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', textDecoration: 'none', color: 'inherit' }}>
                            <img src={logoImg} alt="GAJA Logo" style={{ height: '75px', objectFit: 'contain' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1', gap: '5px' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '1px', fontFamily: '"Playfair Display", serif', color: '#fff' }}>
                                    GajaAsset
                                </span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', letterSpacing: '3px', fontWeight: '500' }}>
                                    AUCTION & NPL
                                </span>
                            </div>
                        </Link>
                        <p>성공적인 부동산 경매, NPL 투자의 길라잡이</p>
                    </div>
                    <div className="footer-info">
                        <p><strong style={{ color: '#fff', marginRight: '10px' }}>대표</strong> 이상수 (Sang Soo Lee)</p>
                        <p><strong style={{ color: '#fff', marginRight: '10px' }}>상호</strong> (주)가자에셋파트너스, 가자공인중개사사무소, (주)에콜브AI</p>
                        <p><strong style={{ color: '#fff', marginRight: '10px' }}>주소(영업)</strong> 서울특별시 서초구 서초중앙로22길 109, 스톤캐슬2층 (서초동, 유니온 법률사무소)</p>
                        <p><strong style={{ color: '#fff', marginRight: '10px' }}>주소(본사)</strong> 경기도 성남시 분당구 수내로 54, 삼성보보스쉐르빌</p>
                        <p><strong style={{ color: '#fff', marginRight: '10px' }}>주소(AI연구소)</strong> 경기도 오산시 수목원로88번길 35, 오산현대테라타워CMC</p>
                        <p><strong style={{ color: '#fff', marginRight: '10px' }}>연락처</strong>contact@gajaauction.com</p>
                    </div>
                </div>
                <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Business Registration Number removed as per request */}
                    <p>&copy; 2026 Gaja Auction NPL Consulting. All rights reserved.</p>
                    <Link to="/admin" style={{ fontSize: '0.8rem', opacity: 0.5, color: '#666', textDecoration: 'none' }}>Admin Access</Link>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
