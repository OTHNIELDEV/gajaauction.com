import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className="admin-login" style={{ minHeight: '100vh', background: '#02060b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ marginBottom: '30px', color: 'var(--accent-gold)' }}>GAJA ADMIN</h2>
                <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1rem' }}>Login</button>
                </form>
                <p style={{ marginTop: '20px', color: '#666', fontSize: '0.8rem' }}>(Demo Password: admin1234)</p>
            </div>
        </div>
    );
};

export default AdminLogin;
