import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DataManager from '../../utils/DataManager';

const AdminSettings = () => {
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}>설정 (Settings)</h1>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>v1.0.0</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                    {/* Profile Section (Mock) */}
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#000', marginRight: '15px' }}>
                                A
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>관리자 (Admin)</h3>
                                <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>super_admin@gaja.com</p>
                            </div>
                        </div>
                        <button className="btn-outline" style={{ width: '100%', fontSize: '0.9rem' }}>프로필 편집</button>
                    </div>

                    {/* Notifications Section */}
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                            <i className="fas fa-bell" style={{ marginRight: '10px', color: 'var(--accent-gold)' }}></i>알림 설정
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#ccc' }}>이메일 알림 (신규 문의)</span>
                                <div
                                    onClick={() => handleToggle('email')}
                                    style={{
                                        width: '40px', height: '20px',
                                        background: notifications.email ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                                        borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '16px', height: '16px', background: 'white', borderRadius: '50%',
                                        position: 'absolute', top: '2px', left: notifications.email ? '22px' : '2px', transition: 'all 0.3s'
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#ccc' }}>푸시 알림</span>
                                <div
                                    onClick={() => handleToggle('push')}
                                    style={{
                                        width: '40px', height: '20px',
                                        background: notifications.push ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                                        borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '16px', height: '16px', background: 'white', borderRadius: '50%',
                                        position: 'absolute', top: '2px', left: notifications.push ? '22px' : '2px', transition: 'all 0.3s'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Management Section */}
                    <div className="glass-card" style={{ padding: '25px', gridColumn: '1 / -1' }}>
                        <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                            <i className="fas fa-database" style={{ marginRight: '10px', color: 'var(--accent-gold)' }}></i>데이터 관리
                        </h3>
                        <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9rem' }}>
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
