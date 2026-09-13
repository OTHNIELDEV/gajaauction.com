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
            <h1 style={{ marginBottom: '30px', fontSize: '1.8rem', color: 'var(--admin-text-main)' }}>Customer Inquiries</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {inquiries.map(inquiry => (
                    <div key={inquiry.id} className="admin-card" style={{ padding: '20px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '10px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', color: 'var(--admin-text-main)', marginBottom: '4px' }}>{inquiry.name || 'Unknown User'}</h3>
                                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', margin: 0 }}>{inquiry.date}</p>
                            </div>
                            <StatusBadge status={inquiry.status} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '2px' }}>Interest</label>
                                <span style={{ color: 'var(--admin-text-sub)', fontSize: '0.92rem' }}>{inquiry.interest}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '2px' }}>Budget</label>
                                <span style={{ color: 'var(--admin-text-sub)', fontSize: '0.92rem' }}>{inquiry.budget}</span>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '2px' }}>Contact</label>
                                <a href={`tel:${inquiry.phone}`} style={{ color: 'var(--accent-gold)', fontSize: '1.05rem', fontWeight: '600', textDecoration: 'none' }}>{inquiry.phone}</a>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <a href={`tel:${inquiry.phone}`} className="btn-primary" style={{ flex: '1 1 70px', padding: '9px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                                <i className="fas fa-phone-alt" style={{ marginRight: '5px' }}></i> Call
                            </a>
                            <select
                                value={inquiry.status}
                                onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                                className="admin-select"
                                style={{
                                    flex: '1 1 100px',
                                    padding: '8px 12px',
                                    borderRadius: '50px',
                                    fontSize: '0.85rem'
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
                                aria-label="Delete inquiry"
                                style={{
                                    padding: '8px 14px',
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
