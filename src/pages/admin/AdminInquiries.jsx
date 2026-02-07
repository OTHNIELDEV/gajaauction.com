import React, { useState, useEffect } from 'react';
import DataManager from '../../utils/DataManager';

const AdminInquiries = () => {
    // Mock Inquiry Data
    const [inquiries, setInquiries] = useState([]);

    useEffect(() => {
        DataManager.init();
        setInquiries(DataManager.getInquiries());
    }, []);

    const handleStatusChange = (id, newStatus) => {
        const updated = DataManager.updateInquiryStatus(id, newStatus);
        setInquiries(updated);
    };

    const StatusBadge = ({ status }) => {
        let color = '#a8b2d1';
        let bg = 'rgba(255,255,255,0.1)';

        if (status === 'New') { color = '#FF5722'; bg = 'rgba(255,87,34,0.15)'; }
        if (status === 'Contacted') { color = '#FFC107'; bg = 'rgba(255,193,7,0.15)'; }
        if (status === 'Resolved') { color = '#4CAF50'; bg = 'rgba(76,175,80,0.15)'; }

        return (
            <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color, background: bg }}>
                {status}
            </span>
        );
    };

    return (
        <div className="admin-inquiries">
            <h1 style={{ marginBottom: '30px', fontSize: '1.8rem', color: 'white' }}>Customer Inquiries</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {inquiries.map(inquiry => (
                    <div key={inquiry.id} className="glass-card" style={{ padding: '25px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '5px' }}>{inquiry.name || 'Unknown User'}</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>{inquiry.date}</p>
                            </div>
                            <StatusBadge status={inquiry.status} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Interest</label>
                                <span style={{ color: '#a8b2d1' }}>{inquiry.interest}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Budget</label>
                                <span style={{ color: '#a8b2d1' }}>{inquiry.budget}</span>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '3px' }}>Contact</label>
                                <span style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>{inquiry.phone}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}>
                                <i className="fas fa-phone-alt" style={{ marginRight: '5px' }}></i> Call
                            </button>
                            <select
                                value={inquiry.status}
                                onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    borderRadius: '50px'
                                }}
                            >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                            <button
                                onClick={() => {
                                    if (window.confirm('정말 삭제하시겠습니까?')) {
                                        const updated = DataManager.deleteInquiry(inquiry.id);
                                        setInquiries(updated);
                                    }
                                }}
                                style={{
                                    padding: '10px 15px',
                                    background: 'rgba(255, 107, 107, 0.15)',
                                    border: '1px solid rgba(255, 107, 107, 0.3)',
                                    color: '#ff6b6b',
                                    borderRadius: '50px',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminInquiries;
