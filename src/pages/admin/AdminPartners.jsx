import React, { useState, useEffect } from 'react';
import DataManager from '../../utils/DataManager';

const AdminPartners = () => {
    // Ensure partnersData exists or use defaults
    const [partners, setPartners] = useState([]);

    useEffect(() => {
        DataManager.init();
        setPartners(DataManager.getPartners());
    }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [currentPartner, setCurrentPartner] = useState(null);

    const handleEdit = (partner) => {
        setCurrentPartner(partner);
        setIsEditing(true);
    };

    const handleAdd = () => {
        setCurrentPartner({ id: Date.now(), name: '', category: 'Financial', logo: '' });
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this partner?')) {
            const updated = DataManager.deletePartner(id);
            setPartners(updated);
        }
    };

    return (
        <div className="admin-partners">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--admin-text-main)', margin: 0 }}>Partner Management</h1>
                <button className="btn-primary" onClick={handleAdd}>+ Add Partner</button>
            </div>

            <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--admin-table-header-bg)' }}>
                        <tr>
                            <th style={{ padding: '20px', textAlign: 'left', color: 'var(--admin-text-sub)' }}>Name</th>
                            <th style={{ padding: '20px', textAlign: 'left', color: 'var(--admin-text-sub)' }}>Category</th>
                            <th style={{ padding: '20px', textAlign: 'right', color: 'var(--admin-text-sub)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.map(partner => (
                            <tr key={partner.id} style={{ borderBottom: '1px solid var(--admin-table-row-border)' }}>
                                <td style={{ padding: '20px', color: 'var(--admin-text-main)', fontWeight: 'bold' }}>{partner.name}</td>
                                <td style={{ padding: '20px', color: 'var(--admin-text-sub)' }}>{partner.category}</td>
                                <td style={{ padding: '20px', textAlign: 'right' }}>
                                    <button onClick={() => handleEdit(partner)} style={{ marginRight: '15px', color: 'var(--admin-text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(partner.id)} style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditing && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content admin-card" style={{ maxWidth: '400px', background: 'var(--admin-modal-bg)', border: '1px solid var(--admin-border)' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--admin-text-main)' }}>{currentPartner.id ? 'Edit Partner' : 'Add Partner'}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input
                                className="admin-input"
                                placeholder="Partner Name"
                                value={currentPartner.name}
                                onChange={(e) => setCurrentPartner({ ...currentPartner, name: e.target.value })}
                                style={{ width: '100%' }}
                            />
                            <select
                                className="admin-select"
                                value={currentPartner.category}
                                onChange={(e) => setCurrentPartner({ ...currentPartner, category: e.target.value })}
                                style={{ width: '100%' }}
                            >
                                <option value="Financial">Financial</option>
                                <option value="Legal">Legal</option>
                                <option value="Construction">Construction</option>
                            </select>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                                    const updated = DataManager.savePartner(currentPartner);
                                    setPartners(updated);
                                    setIsEditing(false);
                                }}>Save</button>
                                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartners;
