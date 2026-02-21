import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';

const Navbar = ({ onConsultingClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="logo" onClick={scrollToTop} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={logoImg} alt="GAJA Logo" style={{ height: '75px', objectFit: 'contain' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1', gap: '5px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '1px', fontFamily: '"Playfair Display", serif' }}>
                            GajaAsset
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', letterSpacing: '3px', fontWeight: '500' }}>
                            AUCTION & NPL
                        </span>
                    </div>
                </Link>
                <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
                    <li><Link to="/map" onClick={() => setIsMenuOpen(false)}>Map Search</Link></li>
                    <li><Link to="/listings" onClick={() => setIsMenuOpen(false)}>Listings</Link></li>
                    <li><Link to="/partners" onClick={() => setIsMenuOpen(false)}>Partners</Link></li>

                    <li><a href="#contact" className="btn-primary" onClick={() => { onConsultingClick(); setIsMenuOpen(false); }}>Consulting</a></li>
                </ul>
                <div className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <i className="fas fa-bars"></i>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
