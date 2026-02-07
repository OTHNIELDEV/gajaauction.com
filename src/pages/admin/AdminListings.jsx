import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataManager from '../../utils/DataManager';

const AdminListings = () => {
    const [listings, setListings] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'edit'
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        // Initialize and load data
        DataManager.init();
        setListings(DataManager.getListings());
    }, []);

    const handleEdit = (item) => {
        setEditingItem(item);
        setViewMode('edit');
    };

    const handleCreate = () => {
        setEditingItem({
            id: Date.now(), // Simple unique ID
            title: '',
            location: '',
            appraisal: '',
            minPrice: '',
            rate: '',
            category: '빌딩/오피스',
            tags: [],
            img: 'https://via.placeholder.com/400x300',
            status: 'Active'
        });
        setViewMode('edit');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            const updated = DataManager.deleteListing(id);
            setListings(updated);
        }
    };

    const handleSave = (item) => {
        const updatedListings = DataManager.saveListing(item);
        setListings(updatedListings);
        setViewMode('list');
    };

    const filteredListings = listings.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="admin-listings">
            {viewMode === 'list' ? (
                <div className="list-view">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="search-box" style={{ position: 'relative' }}>
                                <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}></i>
                                <input
                                    type="text"
                                    placeholder="Search listings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '10px 10px 10px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        width: '300px'
                                    }}
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white'
                                }}
                            >
                                <option value="All">All Categories</option>
                                <option value="빌딩/오피스">빌딩/오피스</option>
                                <option value="아파트/주택">아파트/주택</option>
                                <option value="상가">상가</option>
                                <option value="토지">토지</option>
                                <option value="NPL">NPL</option>
                            </select>
                        </div>
                        <button className="btn-primary" onClick={handleCreate}>+ Add Listing</button>
                    </div>

                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left', color: '#a8b2d1', fontWeight: '500' }}>Property</th>
                                    <th style={{ padding: '15px', textAlign: 'left', color: '#a8b2d1', fontWeight: '500' }}>Price Info</th>
                                    <th style={{ padding: '15px', textAlign: 'left', color: '#a8b2d1', fontWeight: '500' }}>Category</th>
                                    <th style={{ padding: '15px', textAlign: 'left', color: '#a8b2d1', fontWeight: '500' }}>Status</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: '#a8b2d1', fontWeight: '500' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredListings.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <img src={item.img} alt="" style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: 'white' }}>{item.title}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.location}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ color: 'var(--accent-gold)' }}>{item.minPrice}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Appraised: {item.appraisal}</div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: 'rgba(255,255,255,0.05)',
                                                fontSize: '0.85rem'
                                            }}>{item.category}</span>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                color: item.status === 'Sold' ? '#ff6b6b' : '#4CAF50',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}>{item.status || 'Active'}</span>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            <button onClick={() => handleEdit(item)} style={{ marginRight: '10px', background: 'none', border: 'none', color: '#a8b2d1', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredListings.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No listings found matching your criteria.</div>
                        )}
                    </div>
                </div>
            ) : (
                <ListingEditor item={editingItem} onSave={handleSave} onCancel={() => setViewMode('list')} />
            )}
        </div>
    );
};

const ListingEditor = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ ...item });
    const [activeTab, setActiveTab] = useState('basic');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTagsChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        setFormData({ ...formData, tags });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="editor-container"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: 'white', fontSize: '1.5rem' }}>{item.id && typeof item.id === 'string' && item.id.includes('new') ? 'Create Listing' : 'Edit Listing'}</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={onCancel} className="btn-outline">Cancel</button>
                    <button onClick={() => onSave(formData)} className="btn-primary">Save Changes</button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '30px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px' }}>
                    {['basic', 'financial', 'media'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 20px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid var(--accent-gold)' : '2px solid transparent',
                                color: activeTab === tab ? 'var(--accent-gold)' : '#a8b2d1',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            {tab} Info
                        </button>
                    ))}
                </div>

                {activeTab === 'basic' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        <InputField label="Title" name="title" value={formData.title} onChange={handleChange} />
                        <InputField label="Location" name="location" value={formData.location} onChange={handleChange} />
                        <div className="form-group">
                            <label style={{ display: 'block', color: '#a8b2d1', marginBottom: '8px', fontSize: '0.9rem' }}>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="admin-input"
                            >
                                <option value="빌딩/오피스">빌딩/오피스</option>
                                <option value="아파트/주택">아파트/주택</option>
                                <option value="상가">상가</option>
                                <option value="토지">토지</option>
                                <option value="NPL">NPL</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', color: '#a8b2d1', marginBottom: '8px', fontSize: '0.9rem' }}>Status</label>
                            <select
                                name="status"
                                value={formData.status || 'Active'}
                                onChange={handleChange}
                                className="admin-input"
                            >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Sold">Sold</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <InputField label="Tags (comma separated)" name="tags" value={formData.tags.join(', ')} onChange={handleTagsChange} />
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        <InputField label="Appraisal Price" name="appraisal" value={formData.appraisal} onChange={handleChange} />
                        <InputField label="Min Price (Startup)" name="minPrice" value={formData.minPrice} onChange={handleChange} />
                        <InputField label="Auction Rate" name="rate" value={formData.rate} onChange={handleChange} placeholder="e.g. 70%" />
                    </div>
                )}

                {activeTab === 'media' && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#a8b2d1', marginBottom: '8px', fontSize: '0.9rem' }}>Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, img: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                style={{
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px dashed rgba(255,255,255,0.3)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    width: '100%',
                                    cursor: 'pointer'
                                }}
                            />
                            <div style={{ margin: '10px 0', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>OR</div>
                            <InputField label="Image URL" name="img" value={formData.img} onChange={handleChange} placeholder="https://..." />
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', color: '#a8b2d1', marginBottom: '10px' }}>Preview</label>
                            <div style={{
                                width: '100%',
                                height: '250px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <img
                                    src={formData.img}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<span style="color:#666">Invalid Image</span>';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .admin-input {
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px;
                    color: white;
                    width: 100%;
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                .admin-input:focus {
                    outline: none;
                    border-color: var(--accent-gold);
                    background: rgba(255,255,255,0.08);
                }
            `}</style>
        </motion.div>
    );
};

const InputField = ({ label, name, value, onChange, placeholder }) => (
    <div className="form-group">
        <label style={{ display: 'block', color: '#a8b2d1', marginBottom: '8px', fontSize: '0.9rem' }}>{label}</label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="admin-input"
        />
    </div>
);

export default AdminListings;
