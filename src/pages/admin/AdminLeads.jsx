import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminLeads.css';

const AdminLeads = () => {
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads:', error);
        } else {
            setLeads(data);
        }
        setIsLoading(false);
    };

    const fetchMessages = async (sessionId) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
        } else {
            setMessages(data);
        }
    };

    const handleViewChat = async (lead) => {
        setSelectedLead(lead);
        await fetchMessages(lead.source_session_id);
    };

    const closeChat = () => {
        setSelectedLead(null);
        setMessages([]);
    };

    // Stats Calculation
    const totalLeads = leads.length;
    const nplInterests = leads.filter(l => l.interest_category === 'NPL').length;
    const aptInterests = leads.filter(l => l.interest_category === 'Apartment').length;
    const todayLeads = leads.filter(l => {
        const d = new Date(l.created_at);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    }).length;

    return (
        <div className="admin-leads-container">
            <header className="admin-header">
                <h1 className="admin-title">Lead Management Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Capture and analyze potential client interactions from Digital CEO.
                </p>
            </header>

            {/* Stats Overview */}
            <div className="stats-grid">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card"
                >
                    <span className="stat-label">Total Leads</span>
                    <span className="stat-value">{totalLeads}</span>
                    <i className="fas fa-users stat-icon"></i>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                >
                    <span className="stat-label">Today's New</span>
                    <span className="stat-value">{todayLeads}</span>
                    <i className="fas fa-calendar-day stat-icon"></i>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="stat-card"
                >
                    <span className="stat-label">NPL Interest</span>
                    <span className="stat-value text-gold">{nplInterests}</span>
                    <i className="fas fa-chart-line stat-icon"></i>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="stat-card"
                >
                    <span className="stat-label">Apartment</span>
                    <span className="stat-value" style={{ color: '#93c5fd' }}>{aptInterests}</span>
                    <i className="fas fa-building stat-icon"></i>
                </motion.div>
            </div>

            {/* Leads Table */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                    <p style={{ marginTop: '10px' }}>Loading leads data...</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="leads-table-container"
                >
                    <table className="leads-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Contact Info</th>
                                <th>Interest Category</th>
                                <th>Session ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                        No leads found yet.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead, index) => (
                                    <motion.tr
                                        key={lead.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td>
                                            {new Date(lead.created_at).toLocaleDateString()}<br />
                                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                {new Date(lead.created_at).toLocaleTimeString()}
                                            </span>
                                        </td>
                                        <td style={{ color: '#fff', fontWeight: '500' }}>
                                            {lead.contact_info}
                                        </td>
                                        <td>
                                            <span className={`badge ${lead.interest_category === 'NPL' ? 'badge-npl' :
                                                    lead.interest_category === 'Apartment' ? 'badge-apt' :
                                                        'badge-general'
                                                }`}>
                                                {lead.interest_category}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', opacity: 0.7 }}>
                                            {lead.source_session_id.slice(0, 8)}...
                                        </td>
                                        <td>
                                            <button
                                                className="btn-chat"
                                                onClick={() => handleViewChat(lead)}
                                            >
                                                <i className="fas fa-comments"></i> View Chat
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Chat History Modal */}
            <AnimatePresence>
                {selectedLead && (
                    <div className="modal-overlay" onClick={closeChat}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="chat-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div>
                                    <h3 className="modal-title">Conversation History</h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
                                        {selectedLead.contact_info}
                                    </span>
                                </div>
                                <button className="btn-close" onClick={closeChat}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="chat-content">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}
                                    >
                                        {msg.content}
                                        <span className="message-time">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminLeads;
