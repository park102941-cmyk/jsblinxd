import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { GOOGLE_SCRIPT_URL } from '../../lib/config';
import { ShoppingBag, Package, Truck, AlertCircle } from 'lucide-react';

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Products from Firestore
                const productsSnapshot = await getDocs(collection(db, "products"));
                const totalProducts = productsSnapshot.size;

                // 2. Fetch Orders from Google Sheet
                let orders = [];
                if (!GOOGLE_SCRIPT_URL.includes('PLACEHOLDER')) {
                    const response = await fetch(GOOGLE_SCRIPT_URL);
                    if (response.ok) {
                        const data = await response.json();
                        // Assuming data is an array of order objects
                        if (Array.isArray(data)) {
                            orders = data.reverse(); // Newest first
                        }
                    }
                }

                const totalOrders = orders.length;
                // Count orders with status '주문접수' (Order Received)
                const pendingOrders = orders.filter(o => o.status === '주문접수').length;
                const recentOrders = orders.slice(0, 5);

                setStats({
                    totalOrders,
                    pendingOrders,
                    totalProducts,
                    recentOrders
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusColor = (status) => {
        if (status === 'shipping') return '#e3f2fd'; // Blue
        if (status === '발주완료') return '#fff3e0'; // Orange
        if (status === '주문접수') return '#e8f5e9'; // Green
        return '#f5f5f7'; // Grey
    };

    if (loading) {
        return <div style={{ padding: '20px', color: '#666' }}>Loading dashboard data...</div>;
    }

    if (error) {
        return (
            <div style={{ padding: '20px', color: '#d32f2f', background: '#fff2f2', borderRadius: '8px' }}>
                <AlertCircle size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                {error}
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', color: '#333' }}>Dashboard Overview</h2>

            {/* KPI Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Total Orders */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ padding: '8px', background: '#e3f2fd', borderRadius: '50%', color: '#1565c0' }}>
                            <ShoppingBag size={20} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Total Orders</h3>
                    </div>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{stats.totalOrders}</p>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Lifetime volume</span>
                </div>

                {/* Pending Orders */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ padding: '8px', background: '#e8f5e9', borderRadius: '50%', color: '#2e7d32' }}>
                            <Truck size={20} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Pending Orders</h3>
                    </div>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stats.pendingOrders > 0 ? '#d32f2f' : '#333', margin: 0 }}>
                        {stats.pendingOrders}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Requires attention</span>
                </div>

                {/* Total Products */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ padding: '8px', background: '#fff3e0', borderRadius: '50%', color: '#ef6c00' }}>
                            <Package size={20} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>Active Products</h3>
                    </div>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{stats.totalProducts}</p>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>In catalog</span>
                </div>
            </div>

            {/* Recent Orders List */}
            <div style={{ background: '#fff', padding: '30px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Recent Orders</h3>

                {stats.recentOrders.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No recent orders found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>Date</th>
                                    <th style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>Order ID</th>
                                    <th style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>Product</th>
                                    <th style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                                            {/* Fix mapping: email field holds the date based on observation */}
                                            {order.email ? new Date(order.email).toLocaleDateString() : '-'}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                            {/* Fix mapping: date field holds the ID */}
                                            {order.date}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                                            {/* Fix mapping: orderId field holds the Product */}
                                            {order.orderId}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                background: getStatusColor(order.status),
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                color: '#333'
                                            }}>
                                                {order.status || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
