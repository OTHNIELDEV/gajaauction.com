import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoDark from '../assets/images/logo_dark_trans.png';
import logoLight from '../assets/images/logo_light_trans.png';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ onConsultingClick }) => {
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExitWiseDropdownOpen, setIsExitWiseDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const prevPathRef = useRef(location.pathname);
    const { isDark } = useTheme();
    const logoImg = isDark ? logoDark : logoLight;


    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsExitWiseDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    // Close on resize to desktop (width > 992)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 992) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close on actual route navigation
    useEffect(() => {
        if (prevPathRef.current !== location.pathname) {
            setIsMenuOpen(false);
            setIsExitWiseDropdownOpen(false);
            prevPathRef.current = location.pathname;
        }
    }, [location.pathname]);


    return (
        <nav className="navbar">
            <div className="container">
                {/* Brand Logo (줄바꿈 방지 및 최적화) */}
                <Link to="/" className="nav-logo-link" onClick={scrollToTop}>
                    <img src={logoImg} alt="가자에셋파트너스 로고" className="nav-logo-img" />
                    <div className="nav-brand-text">
                        <span className="nav-brand-kr">
                            <span className="corp-prefix">(주)</span>가자에셋파트너스
                        </span>
                        <span className="nav-brand-en">
                            GajaAsset Partners
                        </span>
                    </div>
                </Link>

                {/* Primary Navigation & ExitWise Hub */}
                <div className="nav-actions">
                    <ul className={`nav-links navbar-clean-links ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
                        <li><Link to="/map" onClick={() => setIsMenuOpen(false)}>Map Search</Link></li>
                        <li><Link to="/listings" onClick={() => setIsMenuOpen(false)}>Listings</Link></li>
                        <li><Link to="/partners" onClick={() => setIsMenuOpen(false)}>Partners</Link></li>

                        {/* ExitWise AI Hub Dropdown */}
                        <li 
                            className={`exitwise-dropdown-container ${isExitWiseDropdownOpen ? 'is-open' : ''}`}
                            ref={dropdownRef}
                        >
                            <button 
                                type="button"
                                className="exitwise-trigger-btn"
                                onClick={() => setIsExitWiseDropdownOpen(!isExitWiseDropdownOpen)}
                                aria-expanded={isExitWiseDropdownOpen}
                            >
                                <i className="fas fa-bolt bolt-icon"></i>
                                <span>ExitWise AI</span>
                                <span className="hub-badge">HUB</span>
                                <i className="fas fa-chevron-down caret-icon"></i>
                            </button>

                            <div className="exitwise-dropdown-panel">
                                <div className="exitwise-menu-header">
                                    <span>ExitWise Ecosystem</span>
                                    <small>AI IM 솔루션 연동</small>
                                </div>

                                <Link 
                                    to="/exitwise-bridge" 
                                    className="exitwise-menu-item"
                                    onClick={() => { setIsMenuOpen(false); setIsExitWiseDropdownOpen(false); }}
                                >
                                    <div className="exitwise-item-icon icon-bridge">
                                        <i className="fas fa-layer-group"></i>
                                    </div>
                                    <div className="exitwise-item-info">
                                        <div className="exitwise-item-title-row">
                                            <span className="exitwise-item-title">매물 연동 스튜디오</span>
                                            <span className="tag-badge tag-bridge">STUDIO</span>
                                        </div>
                                        <span className="exitwise-item-desc">채팅창 생성 IM을 가자에셋 매물로 실시간 등록</span>
                                    </div>
                                </Link>

                                <a 
                                    href="https://exitwise.io" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="exitwise-menu-item"
                                    onClick={() => { setIsMenuOpen(false); setIsExitWiseDropdownOpen(false); }}
                                >
                                    <div className="exitwise-item-icon icon-platform">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                    <div className="exitwise-item-info">
                                        <div className="exitwise-item-title-row">
                                            <span className="exitwise-item-title">
                                                ExitWise AI 공식 <i className="fas fa-external-link-alt" style={{ fontSize: '0.65rem', opacity: 0.6 }}></i>
                                            </span>
                                            <span className="tag-badge tag-platform">OFFICIAL</span>
                                        </div>
                                        <span className="exitwise-item-desc">AI 자산 매물 IM 자동화 생성 엔진</span>
                                    </div>
                                </a>

                                <a 
                                    href="https://gajaasset.xwise.net" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="exitwise-menu-item"
                                    onClick={() => { setIsMenuOpen(false); setIsExitWiseDropdownOpen(false); }}
                                >
                                    <div className="exitwise-item-icon icon-im-mgr">
                                        <i className="fas fa-file-contract"></i>
                                    </div>
                                    <div className="exitwise-item-info">
                                        <div className="exitwise-item-title-row">
                                            <span className="exitwise-item-title">
                                                IM Manager 콘솔 <i className="fas fa-external-link-alt" style={{ fontSize: '0.65rem', opacity: 0.6 }}></i>
                                            </span>
                                            <span className="tag-badge tag-mgr">ENTERPRISE</span>
                                        </div>
                                        <span className="exitwise-item-desc">가자에셋 전용 IM 전문 통합 관리자 시스템</span>
                                    </div>
                                </a>
                            </div>
                        </li>

                        {/* Consulting Button */}
                        <li>
                            <a 
                                href="#contact" 
                                className="btn-primary" 
                                style={{ color: '#000000', fontWeight: 700 }}
                                onClick={(e) => { 
                                    if (onConsultingClick) {
                                        e.preventDefault();
                                        onConsultingClick();
                                    }
                                    setIsMenuOpen(false); 
                                }}
                            >
                                <i className="fas fa-paper-plane" style={{ marginRight: '6px', fontSize: '0.85rem' }}></i>
                                Consulting
                            </a>
                        </li>
                    </ul>

                    {/* Theme Toggle & Mobile Menu Hamburger */}
                    <div className="nav-extra" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <ThemeToggle />
                        <div className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

