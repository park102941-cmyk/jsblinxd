import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Package, ShoppingBag, TrendingDown, Settings } from 'lucide-react';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all');
    const [settings, setSettings] = useState({
        newOrders: true,
        lowStock: true,
        customerMessages: true,
        systemAlerts: true,
        emailNotifications: true,
        soundEnabled: true
    });

    useEffect(() => {
        // Mock notifications - in production, fetch from backend
        const mockNotifications = [
            {
                id: 1,
                type: 'order',
                title: 'New Order Received',
                message: 'Order #12345 from John Doe - $245.00',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                read: false,
                priority: 'high'
            },
            {
                id: 2,
                type: 'inventory',
                title: 'Low Stock Alert',
                message: 'Zebra Shade - White color is running low (5 units remaining)',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                read: false,
                priority: 'medium'
            },
            {
                id: 3,
                type: 'inventory',
                title: 'Out of Stock',
                message: 'Roller Shade - Black is out of stock',
                timestamp: new Date(Date.now() - 1000 * 60 * 60),
                read: true,
                priority: 'high'
            },
            {
                id: 4,
                type: 'system',
                title: 'System Update',
                message: 'New features available in admin panel',
                timestamp: new Date(Date.now() - 1000 * 60 * 120),
                read: true,
                priority: 'low'
            },
            {
                id: 5,
                type: 'order',
                title: 'Order Shipped',
                message: 'Order #12340 has been shipped',
                timestamp: new Date(Date.now() - 1000 * 60 * 180),
                read: true,
                priority: 'low'
            }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <ShoppingBag size={20} />;
            case 'inventory': return <Package size={20} />;
            case 'system': return <Settings size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return { bg: '#ffebee', border: '#c62828', icon: '#c62828' };
            case 'medium': return { bg: '#fff3e0', border: '#ef6c00', icon: '#ef6c00' };
            case 'low': return { bg: '#e3f2fd', border: '#1565c0', icon: '#1565c0' };
            default: return { bg: '#f5f5f5', border: '#999', icon: '#999' };
        }
    };

    const formatTimestamp = (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333', margin: 0, marginBottom: '8px' }}>
                        Notification Center
                    </h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    style={{
                        padding: '10px 20px',
                        background: unreadCount > 0 ? '#667eea' : '#e0e0e0',
                        color: unreadCount > 0 ? 'white' : '#999',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: unreadCount > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Check size={18} /> Mark All as Read
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #f0f0f0', paddingBottom: '0' }}>
                {[
                    { value: 'all', label: 'All' },
                    { value: 'unread', label: 'Unread' },
                    { value: 'order', label: 'Orders' },
                    { value: 'inventory', label: 'Inventory' },
                    { value: 'system', label: 'System' }
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        style={{
                            padding: '12px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: filter === tab.value ? '2px solid #667eea' : '2px solid transparent',
                            color: filter === tab.value ? '#667eea' : '#666',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: filter === tab.value ? '600' : '500',
                            transition: 'all 0.2s ease',
                            marginBottom: '-2px'
                        }}
                    >
                        {tab.label}
                        {tab.value === 'unread' && unreadCount > 0 && (
                            <span style={{
                                marginLeft: '8px',
                                padding: '2px 8px',
                                background: '#667eea',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{
                        background: 'white',
                        padding: '60px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <Bell size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                        <p style={{ color: '#999', fontSize: '1rem', margin: 0 }}>No notifications to display</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => {
                        const colors = getPriorityColor(notification.priority);
                        return (
                            <div
                                key={notification.id}
                                style={{
                                    background: notification.read ? 'white' : '#f8f9ff',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    borderLeft: `4px solid ${colors.border}`,
                                    display: 'flex',
                                    gap: '16px',
                                    alignItems: 'flex-start',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                                onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
                                onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: colors.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: colors.icon,
                                    flexShrink: 0
                                }}>
                                    {getIcon(notification.type)}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{
                                            fontSize: '1rem',
                                            fontWeight: notification.read ? '500' : '600',
                                            color: '#333',
                                            margin: 0
                                        }}>
                                            {notification.title}
                                            {!notification.read && (
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    background: '#667eea',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    marginLeft: '8px'
                                                }}></span>
                                            )}
                                        </h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                color: '#999',
                                                transition: 'color 0.2s ease'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.color = '#c62828'}
                                            onMouseOut={e => e.currentTarget.style.color = '#999'}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                                        {notification.message}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: '#999', fontSize: '0.8rem' }}>
                                            {formatTimestamp(notification.timestamp)}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px',
                                            background: colors.bg,
                                            color: colors.icon,
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {notification.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Notification Settings */}
            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginTop: '30px'
            }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={20} /> Notification Settings
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {Object.entries(settings).map(([key, value]) => (
                        <label key={key} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#e9ecef'}
                        onMouseOut={e => e.currentTarget.style.background = '#f8f9fa'}
                        >
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: '#333', textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
