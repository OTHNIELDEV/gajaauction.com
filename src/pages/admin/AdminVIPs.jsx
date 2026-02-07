import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataManager from '../../utils/DataManager';

const AdminVIPs = () => {
    const [vips, setVips] = useState([]);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'communication', 'analytics'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newVIP, setNewVIP] = useState({ name: '', phone: '', grade: 'Silver', notes: '' });
    const [selectedVIPs, setSelectedVIPs] = useState([]);

    useEffect(() => {
        DataManager.init();
        const loadedVIPs = DataManager.getVIPs();
        setVips(loadedVIPs);
    }, []);

    const handleAddVIP = () => {
        const added = DataManager.addVIP(newVIP);
        setVips(DataManager.getVIPs());
        setIsModalOpen(false);
        setNewVIP({ name: '', phone: '', grade: 'Silver', notes: '' });
        alert(`VIP 회원 ${added.name}님이 등록되었습니다.`);
    };

    const handleDelete = (id) => {
        if (window.confirm('정말 이 VIP 회원을 삭제하시겠습니까?')) {
            const updated = DataManager.deleteVIP(id);
            setVips(updated);
        }
    };

    const toggleSelect = (id) => {
        if (selectedVIPs.includes(id)) {
            setSelectedVIPs(selectedVIPs.filter(vid => vid !== id));
        } else {
            setSelectedVIPs([...selectedVIPs, id]);
        }
    };

    const handleSend = (type) => {
        if (selectedVIPs.length === 0) return alert('발송할 회원을 선택해주세요.');
        const count = selectedVIPs.length;
        alert(`${count}명의 VIP에게 ${type === 'sms' ? '문자' : '뉴스레터'} 발송을 완료했습니다.\n(Mock Function Sent)`);
        setSelectedVIPs([]);
    };

    const GradeBadge = ({ grade }) => {
        let color = '#ccc';
        let bg = 'rgba(255,255,255,0.1)';
        if (grade === 'Black') { color = '#000'; bg = 'var(--accent-gold)'; }
        if (grade === 'Platinum') { color = '#e5e4e2'; bg = 'rgba(229, 228, 226, 0.3)'; }
        if (grade === 'Gold') { color = '#FFD700'; bg = 'rgba(255, 215, 0, 0.2)'; }
        return (
            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', color, background: bg }}>
                {grade}
            </span>
        );
    };

    return (
        <div className="admin-vips">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'white', margin: 0 }}>VIP Lounge</h1>
                <div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Add VIP
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['list', 'communication', 'analytics'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid var(--accent-gold)' : '2px solid transparent',
                            color: activeTab === tab ? 'var(--accent-gold)' : '#888',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'communication' ? 'Send Info' : tab === 'analytics' ? 'Data & Analytics' : 'VIP List'}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {activeTab === 'list' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e6f1ff' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Grade</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Phone</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Joined</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Notes</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vips.length > 0 ? vips.map(vip => (
                                    <tr key={vip.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{vip.name}</td>
                                        <td style={{ padding: '15px' }}><GradeBadge grade={vip.grade} /></td>
                                        <td style={{ padding: '15px', fontFamily: 'monospace' }}>{vip.phone}</td>
                                        <td style={{ padding: '15px', color: '#888' }}>{vip.joinedDate}</td>
                                        <td style={{ padding: '15px', color: '#aaa', fontSize: '0.9rem' }}>{vip.notes}</td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            <button onClick={() => handleDelete(vip.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>등록된 VIP 회원이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {activeTab === 'communication' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'white', marginBottom: '20px' }}><i className="fas fa-paper-plane" style={{ color: 'var(--accent-gold)', marginRight: '10px' }}></i> Send Message</h3>
                            <p style={{ color: '#aaa', marginBottom: '20px' }}>Select VIPs from the list provided below (Mock selector) or 'All VIPs' to send information.</p>

                            <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#ccc' }}>Recipients</label>
                                <select style={{ width: '100%', padding: '10px', background: '#0a1525', border: '1px solid #333', color: 'white', borderRadius: '4px' }}>
                                    <option>All VIPs ({vips.length})</option>
                                    <option>Black Grade Only</option>
                                    <option>Recent Joined (Last 30 days)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <button className="btn-primary" onClick={() => handleSend('newsletter')} style={{ justifyContent: 'center' }}>
                                    Send Newsletter
                                </button>
                                <button className="btn-outline" onClick={() => handleSend('sms')} style={{ justifyContent: 'center' }}>
                                    Send SMS Alert
                                </button>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'white', marginBottom: '20px' }}>Recent History</h3>
                            <ul style={{ listStyle: 'none', padding: 0, color: '#aaa' }}>
                                <li style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span><i className="fas fa-check" style={{ color: 'green', marginRight: '10px' }}></i> 2월 정기 뉴스레터</span>
                                    <span style={{ fontSize: '0.8rem' }}>Yesterday</span>
                                </li>
                                <li style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span><i className="fas fa-check" style={{ color: 'green', marginRight: '10px' }}></i> 긴급 추천 물건 알림 (SMS)</span>
                                    <span style={{ fontSize: '0.8rem' }}>3 days ago</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <h4 style={{ color: '#888', margin: 0 }}>Total VIPs</h4>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-gold)', margin: '10px 0' }}>{vips.length}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <h4 style={{ color: '#888', margin: 0 }}>Top Grade (Black)</h4>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '10px 0' }}>{vips.filter(v => v.grade === 'Black').length}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '25px', textAlign: 'center' }}>
                                <h4 style={{ color: '#888', margin: 0 }}>New (This Month)</h4>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4CAF50', margin: '10px 0' }}>{vips.length > 0 ? 1 : 0}</p>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'white', marginBottom: '20px' }}>Database Export</h3>
                            <p style={{ color: '#aaa', marginBottom: '20px' }}>Download complete VIP database for external analysis (Excel/CSV).</p>
                            <button className="btn-outline" onClick={() => alert("Downloading VIP_Database_2026.csv...")}>
                                <i className="fas fa-download" style={{ marginRight: '10px' }}></i> Download CSV
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay" style={{ display: 'flex' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card"
                            style={{ padding: '30px', width: '400px', background: '#0a1525', border: '1px solid var(--accent-gold)' }}
                        >
                            <h2 style={{ color: 'white', marginBottom: '20px' }}>Add New VIP</h2>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Name</label>
                                <input type="text" className="wizard-input" value={newVIP.name} onChange={e => setNewVIP({ ...newVIP, name: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Phone</label>
                                <input type="text" className="wizard-input" value={newVIP.phone} onChange={e => setNewVIP({ ...newVIP, phone: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Grade</label>
                                <select className="wizard-input" value={newVIP.grade} onChange={e => setNewVIP({ ...newVIP, grade: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }}>
                                    <option value="Silver">Silver</option>
                                    <option value="Gold">Gold</option>
                                    <option value="Platinum">Platinum</option>
                                    <option value="Black">Black (VVIP)</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '5px' }}>Notes</label>
                                <textarea className="wizard-input" value={newVIP.notes} onChange={e => setNewVIP({ ...newVIP, notes: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white', minHeight: '80px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className="btn-primary" onClick={handleAddVIP}>Save</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminVIPs;
