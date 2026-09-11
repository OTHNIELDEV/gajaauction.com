import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoDark from '../assets/images/logo_dark_trans.png';
import logoLight from '../assets/images/logo_light_trans.png';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onConsultingClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isDark } = useTheme();
    const logoImg = isDark ? logoDark : logoLight;

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="logo" onClick={scrollToTop} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
                        <li><Link to="/map" onClick={() => setIsMenuOpen(false)}>Map Search</Link></li>
                        <li><Link to="/listings" onClick={() => setIsMenuOpen(false)}>Listings</Link></li>
                        <li><Link to="/partners" onClick={() => setIsMenuOpen(false)}>Partners</Link></li>
                        <li>
                            <a 
                                href="https://exitwise.io" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                ExitWise AI
                            </a>
                        </li>
                        <li>
                            <a 
                                href="https://gajaasset.xwise.net" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-glass"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                IM Manager
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#contact" 
                                className="btn-primary" 
                                style={{ color: '#000000', fontWeight: 700 }}
                                onClick={() => { onConsultingClick(); setIsMenuOpen(false); }}
                            >
                                Consulting
                            </a>
                        </li>
                    </ul>
                    <div className="nav-extra" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <ThemeToggle />
                        <div className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                        </div>
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
