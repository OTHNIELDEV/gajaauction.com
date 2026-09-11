import React from 'react';
import { Link } from 'react-router-dom';
import logoDark from '../assets/images/logo_dark_trans.png';
import logoLight from '../assets/images/logo_light_trans.png';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
    const { isDark } = useTheme();
    const logoImg = isDark ? logoDark : logoLight;

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" onClick={scrollToTop} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '15px', textDecoration: 'none', color: 'inherit' }}>
                            <img src={logoImg} alt="가자에셋 로고" style={{ height: '54px', objectFit: 'contain' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.15', gap: '3px', width: 'fit-content' }}>
                                <span style={{ 
                                    fontSize: '1.45rem', 
                                    fontWeight: '700', 
                                    letterSpacing: '-0.4px', 
                                    fontFamily: '"Noto Serif KR", "Pretendard", serif', 
                                    color: 'var(--text-white)' 
                                }}>
                                    <span style={{ fontSize: '0.8em', fontWeight: '500', opacity: 0.75, marginRight: '4px' }}>(주)</span>가자에셋파트너스
                                </span>
                                <span style={{ 
                                    fontSize: '0.62rem', 
                                    color: 'var(--accent-gold)', 
                                    letterSpacing: '1.5px', 
                                    fontWeight: '600', 
                                    textTransform: 'uppercase',
                                    alignSelf: 'flex-end',
                                    whiteSpace: 'nowrap'
                                }}>
                                    GajaAsset Partners
                                </span>
                            </div>
                        </Link>
                    </div>
                    <div className="footer-info">
                        <p><strong style={{ color: 'var(--text-white)', marginRight: '10px' }}>대표</strong> 이상수</p>
                        <p><strong style={{ color: 'var(--text-white)', marginRight: '10px' }}>상호</strong> (주)가자에셋파트너스, 가자공인중개사사무소</p>
                        <p><strong style={{ color: 'var(--text-white)', marginRight: '10px' }}>업무</strong> 경매, NPL, 투자, 대출, 중개, 매매, 컨설팅</p>
                        <p><strong style={{ color: 'var(--text-white)', marginRight: '10px' }}>영업</strong> 서울특별시 서초구 서초중앙로22길 109, 스톤캐슬2층 (서초동, 유니온 법률사무소)</p>
                        <p><strong style={{ color: 'var(--text-white)', marginRight: '10px' }}>본사</strong> 경기도 성남시 분당구 수내로 54, 삼성보보스쉐르빌 2707호</p>
                        <p><strong style={{ color: 'var(--text-white)', marginRight: '10px' }}>연락</strong> wise@exitwise.io</p>
                    </div>
                </div>
                <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Business Registration Number removed as per request */}
                    <p>&copy; 2026 (주)가자에셋파트너스  All rights reserved.</p>
                    <Link to="/admin" style={{ fontSize: '0.8rem', opacity: 0.7, color: 'var(--text-gray)', textDecoration: 'none' }}>Admin Access</Link>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
