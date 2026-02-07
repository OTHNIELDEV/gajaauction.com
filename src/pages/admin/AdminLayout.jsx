import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

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
        { path: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
    ];

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#02060b', color: '#e6f1ff' }}>
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 260 }}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                transition={{ duration: 0.3 }}
                style={{
                    background: '#0a1525',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 100
                }}
            >
                {/* Logo Area */}
                <div style={{ padding: '25px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {isSidebarOpen && (
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-gold)', margin: 0 }}>GAJA ADMIN</h2>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                        <i className={isSidebarOpen ? "fas fa-chevron-left" : "fas fa-bars"}></i>
                    </button>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, padding: '20px 0' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path} style={{ marginBottom: '5px' }}>
                                    <Link
                                        to={item.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '15px 25px',
                                            color: isActive ? 'var(--accent-gold)' : '#a8b2d1',
                                            background: isActive ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                                            borderRight: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                            justifyContent: isSidebarOpen ? 'flex-start' : 'center'
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
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                            A
                        </div>
                        {isSidebarOpen && (
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin User</p>
                                <p style={{ fontSize: '0.75rem', color: '#666' }}>Super Admin</p>
                            </div>
                        )}
                    </div>
                    {isSidebarOpen && (
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#aaa',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Logout
                        </button>
                    )}
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, marginLeft: isSidebarOpen ? 260 : 80, transition: 'margin-left 0.3s ease' }}>
                {/* Top Header */}
                <header style={{
                    height: '70px',
                    background: 'rgba(10, 21, 37, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 30px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 90
                }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'white' }}>
                        {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <i className="fas fa-bell" style={{ color: '#a8b2d1', cursor: 'pointer' }}></i>
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '8px', height: '8px', background: 'var(--accent-gold)', borderRadius: '50%' }}></span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ padding: '30px' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
