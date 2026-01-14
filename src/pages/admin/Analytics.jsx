import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { GOOGLE_SCRIPT_URL } from '../../lib/config';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalCustomers: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        bestSellingProducts: [],
        categoryBreakdown: [],
        recentSales: [],
        monthlyRevenue: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30days');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch orders from Google Sheets
            let orders = [];
            if (!GOOGLE_SCRIPT_URL.includes('PLACEHOLDER')) {
                const response = await fetch(GOOGLE_SCRIPT_URL);
                if (response.ok) {
                    const data = await response.json();
                    orders = Array.isArray(data) ? data : [];
                }
            }

            // Fetch products from Firestore
            const productsSnapshot = await getDocs(collection(db, 'products'));
            const products = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate analytics
            const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);
            const totalOrders = orders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            
            // Get unique customers
            const uniqueCustomers = new Set(orders.map(o => o.customerEmail || o.email)).size;

            // Calculate growth (mock data for now)
            const revenueGrowth = 12.5;
            const ordersGrowth = 8.3;

            // Best selling products
            const productSales = {};
            orders.forEach(order => {
                const productName = order.productName || order.orderId || 'Unknown';
                productSales[productName] = (productSales[productName] || 0) + 1;
            });
            const bestSellingProducts = Object.entries(productSales)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Category breakdown
            const categoryCount = {};
            products.forEach(product => {
                const category = product.category || 'Other';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
            const categoryBreakdown = Object.entries(categoryCount)
                .map(([name, count]) => ({ name, count }));

            // Monthly revenue (last 6 months)
            const monthlyRevenue = generateMonthlyRevenue(orders);

            setAnalytics({
                totalRevenue,
                totalOrders,
                avgOrderValue,
                totalCustomers: uniqueCustomers,
                revenueGrowth,
                ordersGrowth,
                bestSellingProducts,
                categoryBreakdown,
                recentSales: orders.slice(0, 10),
                monthlyRevenue
            });
        } catch (error) {
            console.error('Analytics fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateMonthlyRevenue = (orders) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map((month, index) => ({
            month,
            revenue: Math.random() * 10000 + 5000 // Mock data
        }));
    };

    if (loading) {
        return <div style={{ padding: '20px', color: '#666' }}>Loading analytics...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333', margin: 0 }}>Analytics Dashboard</h2>
                <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="1year">Last Year</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {/* Total Revenue */}
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <DollarSign size={24} />
                        <h3 style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>Total Revenue</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '8px 0' }}>${analytics.totalRevenue.toFixed(2)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', opacity: 0.9 }}>
                        <ArrowUp size={16} />
                        <span>+{analytics.revenueGrowth}% from last period</span>
                    </div>
                </div>

                {/* Total Orders */}
                <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '24px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <ShoppingCart size={24} />
                        <h3 style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>Total Orders</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '8px 0' }}>{analytics.totalOrders}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', opacity: 0.9 }}>
                        <ArrowUp size={16} />
                        <span>+{analytics.ordersGrowth}% from last period</span>
                    </div>
                </div>

                {/* Average Order Value */}
                <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '24px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <TrendingUp size={24} />
                        <h3 style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>Avg Order Value</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '8px 0' }}>${analytics.avgOrderValue.toFixed(2)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', opacity: 0.9 }}>
                        <span>Per transaction</span>
                    </div>
                </div>

                {/* Total Customers */}
                <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '24px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Users size={24} />
                        <h3 style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>Total Customers</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '8px 0' }}>{analytics.totalCustomers}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', opacity: 0.9 }}>
                        <span>Unique buyers</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
                {/* Monthly Revenue Chart */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#333' }}>Monthly Revenue Trend</h3>
                    <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 0' }}>
                        {analytics.monthlyRevenue.map((data, index) => {
                            const maxRevenue = Math.max(...analytics.monthlyRevenue.map(d => d.revenue));
                            const height = (data.revenue / maxRevenue) * 100;
                            return (
                                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: '500' }}>${(data.revenue / 1000).toFixed(1)}k</div>
                                    <div style={{ 
                                        width: '100%', 
                                        height: `${height}%`, 
                                        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '6px 6px 0 0',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                    ></div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: '500' }}>{data.month}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#333' }}>Products by Category</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analytics.categoryBreakdown.map((cat, index) => {
                            const colors = ['#667eea', '#f093fb', '#4facfe', '#fa709a', '#43e97b'];
                            const total = analytics.categoryBreakdown.reduce((sum, c) => sum + c.count, 0);
                            const percentage = total > 0 ? (cat.count / total * 100).toFixed(1) : 0;
                            return (
                                <div key={index}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#333', fontWeight: '500', textTransform: 'capitalize' }}>{cat.name}</span>
                                        <span style={{ color: '#666' }}>{cat.count} ({percentage}%)</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${percentage}%`, 
                                            height: '100%', 
                                            background: colors[index % colors.length],
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Best Selling Products */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#333' }}>Top Selling Products</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {analytics.bestSellingProducts.map((product, index) => (
                        <div key={index} style={{ 
                            padding: '16px', 
                            border: '1px solid #e5e5e5', 
                            borderRadius: '8px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.borderColor = '#e5e5e5';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    #{index + 1}
                                </div>
                                <Package size={20} color="#666" />
                            </div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333', marginBottom: '4px' }}>{product.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>{product.count} sales</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
