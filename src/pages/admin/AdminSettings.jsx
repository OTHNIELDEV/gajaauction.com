import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataManager from '../../utils/DataManager';
import { useTheme } from '../../context/ThemeContext';

const AdminSettings = () => {
    const { theme, setTheme, isDark } = useTheme();
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        marketing: false
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleBackup = () => {
        const data = DataManager.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gaja_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        if (window.confirm('경고: 모든 데이터가 초기화됩니다. 이 작업은 되돌릴 수 없습니다.\n정말 진행하시겠습니까? (All data will be reset)')) {
            DataManager.resetData();
            alert('데이터가 초기화되었습니다. 페이지를 새로고침합니다.');
            window.location.reload();
        }
    };

    return (
        <div className="admin-settings">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--admin-text-main)', margin: 0 }}>설정 (Settings)</h1>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>v1.0.0</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                    {/* Profile Section (Mock) */}
                    <div className="admin-card" style={{ padding: '22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#000', marginRight: '14px', flexShrink: 0 }}>
                                A
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--admin-text-main)', fontSize: '1.05rem' }}>관리자 (Admin)</h3>
                                <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>super_admin@gaja.com</p>
                            </div>
                        </div>
                        <button className="btn-outline" style={{ width: '100%', fontSize: '0.88rem' }}>프로필 편집</button>
                    </div>

                    {/* Theme Mode Section */}
                    <div className="admin-card" style={{ padding: '22px' }}>
                        <h3 style={{ color: 'var(--admin-text-main)', fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                            <i className="fas fa-palette" style={{ marginRight: '10px', color: 'var(--accent-gold)' }}></i>화면 테마 설정
                        </h3>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: !isDark ? '2px solid var(--accent-gold)' : '1px solid var(--admin-border)',
                                    background: !isDark ? 'var(--admin-sidebar-active-bg)' : 'var(--admin-input-bg)',
                                    color: 'var(--admin-text-main)',
                                    cursor: 'pointer',
                                    fontWeight: !isDark ? 'bold' : 'normal',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i className="fas fa-sun" style={{ color: '#eab308' }}></i> 라이트 모드
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: isDark ? '2px solid var(--accent-gold)' : '1px solid var(--admin-border)',
                                    background: isDark ? 'var(--admin-sidebar-active-bg)' : 'var(--admin-input-bg)',
                                    color: 'var(--admin-text-main)',
                                    cursor: 'pointer',
                                    fontWeight: isDark ? 'bold' : 'normal',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <i className="fas fa-moon" style={{ color: '#38bdf8' }}></i> 다크 모드
                            </button>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="admin-card" style={{ padding: '25px' }}>
                        <h3 style={{ color: 'var(--admin-text-main)', fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                            <i className="fas fa-bell" style={{ marginRight: '10px', color: 'var(--accent-gold)' }}></i>알림 설정
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--admin-text-sub)' }}>이메일 알림 (신규 문의)</span>
                                <div
                                    onClick={() => handleToggle('email')}
                                    style={{
                                        width: '40px', height: '20px',
                                        background: notifications.email ? 'var(--accent-gold)' : 'var(--admin-pill-inactive-bg)',
                                        borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '16px', height: '16px', background: 'white', borderRadius: '50%',
                                        position: 'absolute', top: '2px', left: notifications.email ? '22px' : '2px', transition: 'all 0.3s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--admin-text-sub)' }}>푸시 알림</span>
                                <div
                                    onClick={() => handleToggle('push')}
                                    style={{
                                        width: '40px', height: '20px',
                                        background: notifications.push ? 'var(--accent-gold)' : 'var(--admin-pill-inactive-bg)',
                                        borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '16px', height: '16px', background: 'white', borderRadius: '50%',
                                        position: 'absolute', top: '2px', left: notifications.push ? '22px' : '2px', transition: 'all 0.3s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Management Section */}
                    <div className="admin-card" style={{ padding: '25px', gridColumn: '1 / -1' }}>
                        <h3 style={{ color: 'var(--admin-text-main)', fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                            <i className="fas fa-database" style={{ marginRight: '10px', color: 'var(--accent-gold)' }}></i>데이터 관리
                        </h3>
                        <p style={{ color: 'var(--admin-text-sub)', marginBottom: '20px', fontSize: '0.9rem' }}>
                            시스템 데이터를 백업하거나 초기화할 수 있습니다.
                            <br />초기화 시 '익명 고객' 데이터 등 모든 변경사항이 삭제되고 초기 상태로 복구됩니다.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleBackup}
                                className="btn-outline"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <i className="fas fa-download"></i> 데이터 백업 (JSON)
                            </button>
                            <button
                                onClick={handleReset}
                                style={{
                                    padding: '10px 20px',
                                    background: 'rgba(255, 107, 107, 0.1)',
                                    border: '1px solid rgba(255, 107, 107, 0.3)',
                                    color: '#ff6b6b',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 107, 0.2)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 107, 107, 0.1)'}
                            >
                                <i className="fas fa-trash-alt"></i> 시스템 초기화 (Reset)
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminSettings;
