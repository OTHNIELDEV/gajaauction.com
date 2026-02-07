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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <div style={{
                            width: '50px', height: '50px', borderRadius: '12px',
                            background: `${stat.color}20`, color: stat.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                        }}>
                            <i className={stat.icon}></i>
                        </div>
                        <div>
                            <h4 style={{ color: '#a8b2d1', fontSize: '0.9rem', marginBottom: '5px' }}>{stat.label}</h4>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white', lineHeight: 1 }}>{stat.value}</span>
                                <span style={{ fontSize: '0.8rem', color: stat.change.includes('+') ? '#4CAF50' : '#FF5722' }}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                {/* Recent Activity */}
                <div className="glass-card" style={{ padding: '25px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'white' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {recentActivities.map(activity => (
                            <div key={activity.id} style={{
                                display: 'flex', alignItems: 'center', gap: '15px',
                                paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{
                                    width: '35px', height: '35px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
                                }}>
                                    <i className={
                                        activity.type === 'inquiry' ? 'fas fa-envelope' :
                                            activity.type === 'update' ? 'fas fa-edit' :
                                                activity.type === 'system' ? 'fas fa-robot' : 'fas fa-handshake'
                                    }></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ color: '#e6f1ff', fontSize: '0.95rem' }}>{activity.action}</p>
                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>{activity.user} • {activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions or System Status */}
                <div className="glass-card" style={{ padding: '25px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'white' }}>System Status</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#a8b2d1' }}>
                            <span>Server Load</span>
                            <span>24%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '24%', height: '100%', background: '#4CAF50' }}></div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#a8b2d1' }}>
                            <span>Storage Usage</span>
                            <span>68%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '68%', height: '100%', background: '#FFC107' }}></div>
                        </div>
                    </div>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1.1rem', color: 'white' }}>Quick Actions</h3>
                    <button className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginBottom: '10px' }}>
                        <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Add New Listing
                    </button>
                    <button style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                        Download Reports
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
