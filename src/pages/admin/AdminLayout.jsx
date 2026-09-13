import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../../components/ThemeToggle';
import './AdminResponsive.css';

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Close mobile menu upon navigation
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
        { path: '/admin/listings', icon: 'fas fa-building', label: 'Listings' },
        { path: '/admin/inquiries', icon: 'fas fa-envelope-open-text', label: 'Inquiries' },
        { path: '/admin/partners', icon: 'fas fa-handshake', label: 'Partners' },
        { path: '/admin/vips', icon: 'fas fa-crown', label: 'VIP Lounge' },
        { path: '/admin/leads', icon: 'fas fa-user-clock', label: 'Leads' },
        { path: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
    ];

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--admin-bg)', color: 'var(--admin-text-main)', position: 'relative' }}>
            {/* Mobile Backdrop Overlay */}
            <div 
                className={`admin-sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <motion.aside
                className={`admin-aside ${isMobileMenuOpen ? 'mobile-open' : 'mobile-closed'}`}
                initial={{ width: 260 }}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                transition={{ duration: 0.3 }}
                style={{
                    background: 'var(--admin-sidebar-bg)',
                    borderRight: '1px solid var(--admin-sidebar-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 100
                }}
            >
                {/* Logo Area */}
                <div style={{ padding: '20px 25px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid var(--admin-sidebar-border)' }}>
                    {isSidebarOpen && (
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-gold)', margin: 0 }}>GAJA ADMIN</h2>
                    )}
                    <button 
                        onClick={() => {
                            if (window.innerWidth <= 992) {
                                setIsMobileMenuOpen(false);
                            } else {
                                setSidebarOpen(!isSidebarOpen);
                            }
                        }} 
                        style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '5px' }}
                        aria-label="Toggle Sidebar"
                    >
                        <i className={isSidebarOpen ? "fas fa-chevron-left" : "fas fa-bars"}></i>
                    </button>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, padding: '15px 0', overflowY: 'auto' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} style={{ marginBottom: '4px' }}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '14px 22px',
                                            color: isActive ? 'var(--accent-gold)' : 'var(--admin-text-sub)',
                                            background: isActive ? 'var(--admin-sidebar-active-bg)' : 'transparent',
                                            borderRight: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                                            fontWeight: isActive ? '600' : '400'
                                        }}
                                    >
                                        <i className={item.icon} style={{ width: '25px', fontSize: '1.1rem' }}></i>
                                        {isSidebarOpen && <span style={{ marginLeft: '10px' }}>{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Profile / Logout */}
                <div style={{ padding: '20px', borderTop: '1px solid var(--admin-sidebar-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                            A
                        </div>
                        {isSidebarOpen && (
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--admin-text-main)', margin: 0 }}>Admin User</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: 0 }}>Super Admin</p>
                            </div>
                        )}
                    </div>
                    {isSidebarOpen && (
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'var(--admin-btn-secondary-bg)',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '6px',
                                color: 'var(--admin-text-sub)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="admin-main-wrapper" style={{ flex: 1, marginLeft: isSidebarOpen ? 260 : 80, transition: 'margin-left 0.3s ease', minWidth: 0 }}>
                {/* Top Header */}
                <header
                    className="admin-header"
                    style={{
                        height: '70px',
                        background: 'var(--admin-header-bg)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: '1px solid var(--admin-header-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 30px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 90
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Mobile Menu Hamburger Button */}
                        <button 
                            className="admin-mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Open navigation drawer"
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--admin-text-main)', margin: 0, whiteSpace: 'nowrap' }}>
                            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {/* Theme Toggle Button */}
                        <ThemeToggle />

                        {/* Notification Bell */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <i className="fas fa-bell" style={{ color: 'var(--admin-text-sub)', fontSize: '1.1rem', cursor: 'pointer' }}></i>
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '8px', height: '8px', background: 'var(--accent-gold)', borderRadius: '50%' }}></span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content-area" style={{ padding: '30px' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
