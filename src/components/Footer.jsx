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
                                    GAJA
                                </span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', letterSpacing: '3px', fontWeight: '500' }}>
                                    AUCTION & NPL
                                </span>
                            </div>
                        </Link>
                        <p>성공적인 투자의 길라잡이</p>
                    </div>
                    <div className="footer-info">
                        <p>대표: 이상수</p>
                        <p>주소: 서울특별시 강남구 테헤란로 123, 가자빌딩 10층</p>
                        <p>Email: contact@gajaauction.com</p>
                    </div>
                </div>
                <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p>&copy; 2026 Gaja Auction NPL Consulting. All rights reserved.</p>
                    <Link to="/admin" style={{ fontSize: '0.8rem', opacity: 0.5, color: '#666', textDecoration: 'none' }}>Admin Access</Link>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
