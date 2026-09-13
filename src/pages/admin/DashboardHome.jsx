import React from 'react';
import { motion } from 'framer-motion';

const DashboardHome = () => {
    // Mock Statistics
    const stats = [
        { label: 'Total Listings', value: '24', change: '+2', icon: 'fas fa-building', color: '#4CAF50' },
        { label: 'Active Inquiries', value: '12', change: '+5', icon: 'fas fa-user-clock', color: '#FFC107' },
        { label: 'Total Asset Value', value: '450억', change: '+12%', icon: 'fas fa-chart-line', color: '#2196F3' },
        { label: 'Pending Reviews', value: '3', change: '-1', icon: 'fas fa-tasks', color: '#FF5722' }
    ];

    const recentActivities = [
        { id: 1, user: 'Kim Min-su', action: 'New inquiry for Gangnam Office', time: '2 mins ago', type: 'inquiry' },
        { id: 2, user: 'Admin', action: 'Updated Listing #14 (Seocho Villa)', time: '1 hour ago', type: 'update' },
        { id: 3, user: 'System', action: 'Weekly Report Generated', time: '5 hours ago', type: 'system' },
        { id: 4, user: 'Lee Ji-won', action: 'New Partner Added: Hana Bank', time: '1 day ago', type: 'partner' },
    ];

    return (
        <div className="dashboard-home">
            {/* Stats Grid */}
            <div className="admin-stats-summary-grid" style={{ marginBottom: '25px' }}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="admin-card"
                        style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
                    >
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                            background: `${stat.color}20`, color: stat.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
                        }}>
                            <i className={stat.icon}></i>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--admin-text-sub)', fontSize: '0.85rem', marginBottom: '4px' }}>{stat.label}</h4>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                <span style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--admin-text-main)', lineHeight: 1 }}>{stat.value}</span>
                                <span style={{ fontSize: '0.8rem', color: stat.change.includes('+') ? '#4CAF50' : '#FF5722' }}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="admin-dashboard-grid">
                {/* Recent Activity */}
                <div className="admin-card" style={{ padding: '22px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--admin-text-main)' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {recentActivities.map(activity => (
                            <div key={activity.id} style={{
                                display: 'flex', alignItems: 'center', gap: '15px',
                                paddingBottom: '15px', borderBottom: '1px solid var(--admin-table-row-border)'
                            }}>
                                <div style={{
                                    width: '35px', height: '35px', borderRadius: '50%',
                                    background: 'var(--admin-tag-bg)', color: 'var(--admin-text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                                }}>
                                    <i className={
                                        activity.type === 'inquiry' ? 'fas fa-envelope' :
                                            activity.type === 'update' ? 'fas fa-edit' :
                                                activity.type === 'system' ? 'fas fa-robot' : 'fas fa-handshake'
                                    }></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: 'var(--admin-text-main)', fontSize: '0.95rem', margin: 0 }}>{activity.action}</p>
                                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>{activity.user} • {activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions or System Status */}
                <div className="admin-card" style={{ padding: '25px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--admin-text-main)' }}>System Status</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--admin-text-sub)' }}>
                            <span>Server Load</span>
                            <span>24%</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--admin-tag-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '24%', height: '100%', background: '#4CAF50' }}></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--admin-text-sub)' }}>
                            <span>Storage Usage</span>
                            <span>68%</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--admin-tag-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '68%', height: '100%', background: '#FFC107' }}></div>
                        </div>
                    </div>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1.1rem', color: 'var(--admin-text-main)' }}>Quick Actions</h3>
                    <button className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginBottom: '10px' }}>
                        <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Add New Listing
                    </button>
                    <button style={{ width: '100%', padding: '12px', background: 'var(--admin-btn-secondary-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-text-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        Download Reports
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
