import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin1234') {
            // In a real app, set a token
            localStorage.setItem('adminToken', 'demo-token');
            navigate('/admin/dashboard');
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    return (
        <div className="admin-login" style={{ minHeight: '100vh', background: 'var(--admin-bg)', color: 'var(--admin-text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '25px', right: '25px' }}>
                <ThemeToggle />
            </div>

            <div className="admin-card" style={{ padding: '36px 28px', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px' }}>
                <h2 style={{ marginBottom: '30px', color: 'var(--accent-gold)', fontWeight: '700' }}>GAJA ADMIN</h2>
                <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="admin-input"
                        style={{
                            padding: '14px',
                            fontSize: '1rem',
                            width: '100%'
                        }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Login</button>
                </form>
                <p style={{ marginTop: '20px', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>(Demo Password: admin1234)</p>
            </div>
        </div>
    );
};

export default AdminLogin;
