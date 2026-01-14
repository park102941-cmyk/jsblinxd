import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Mail, Phone, MapPin, ShoppingBag, Star, Calendar, Search, Filter, Download, UserPlus } from 'lucide-react';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSegment, setFilterSegment] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            // Fetch users from Firestore
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Enrich with mock order data
            const enrichedCustomers = usersData.map(user => ({
                ...user,
                totalOrders: Math.floor(Math.random() * 20),
                totalSpent: Math.floor(Math.random() * 5000),
                lastOrderDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
                averageOrderValue: Math.floor(Math.random() * 500) + 100,
                segment: getCustomerSegment(Math.floor(Math.random() * 20), Math.floor(Math.random() * 5000)),
                tags: generateTags(),
                notes: ''
            }));

            setCustomers(enrichedCustomers);
        } catch (error) {
            console.error('Customers fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCustomerSegment = (orders, spent) => {
        if (orders === 0) return 'new';
        if (orders >= 10 || spent >= 2000) return 'vip';
        if (orders >= 3) return 'regular';
        return 'occasional';
    };

    const generateTags = () => {
        const allTags = ['Smart Home', 'Interior Designer', 'Bulk Buyer', 'Repeat Customer', 'High Value'];
        const numTags = Math.floor(Math.random() * 3);
        return allTags.slice(0, numTags);
    };

    const getSegmentColor = (segment) => {
        switch (segment) {
            case 'vip': return { bg: '#fff3e0', color: '#ef6c00', label: 'VIP' };
            case 'regular': return { bg: '#e3f2fd', color: '#1565c0', label: 'Regular' };
            case 'occasional': return { bg: '#f3e5f5', color: '#7b1fa2', label: 'Occasional' };
            case 'new': return { bg: '#e8f5e9', color: '#2e7d32', label: 'New' };
            default: return { bg: '#f5f5f5', color: '#666', label: 'Unknown' };
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = 
            customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSegment = filterSegment === 'all' || customer.segment === filterSegment;
        return matchesSearch && matchesSegment;
    });

    const stats = {
        total: customers.length,
        vip: customers.filter(c => c.segment === 'vip').length,
        regular: customers.filter(c => c.segment === 'regular').length,
        new: customers.filter(c => c.segment === 'new').length,
        totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
    };

    const exportCustomers = () => {
        const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Segment', 'Last Order'];
        const rows = filteredCustomers.map(c => [
            c.displayName || 'N/A',
            c.email || 'N/A',
            c.phone || 'N/A',
            c.totalOrders || 0,
            `$${c.totalSpent || 0}`,
            getSegmentColor(c.segment).label,
            c.lastOrderDate ? c.lastOrderDate.toLocaleDateString() : 'N/A'
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return <div style={{ padding: '20px', color: '#666' }}>Loading customers...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333', margin: 0 }}>Customer Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={exportCustomers}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '10px 16px', 
                            background: 'var(--primary-green)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}
                    >
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Users size={24} />
                        <h3 style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>Total Customers</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.total}</p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '20px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Star size={24} />
                        <h3 style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>VIP Customers</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.vip}</p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '20px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <UserPlus size={24} />
                        <h3 style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>New Customers</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.new}</p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '20px', borderRadius: '12px', color: 'white', boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <ShoppingBag size={24} />
                        <h3 style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>Total Revenue</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>${stats.totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px 10px 40px', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '6px',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Filter size={18} color="#666" />
                        {['all', 'vip', 'regular', 'occasional', 'new'].map(segment => (
                            <button
                                key={segment}
                                onClick={() => setFilterSegment(segment)}
                                style={{
                                    padding: '10px 16px',
                                    background: filterSegment === segment ? '#667eea' : '#fff',
                                    color: filterSegment === segment ? 'white' : '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {segment === 'all' ? 'All' : getSegmentColor(segment).label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Customer</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Contact</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Orders</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Total Spent</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Segment</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Last Order</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer, index) => {
                                const segmentInfo = getSegmentColor(customer.segment);
                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '1rem'
                                                }}>
                                                    {(customer.displayName || 'U')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                                                        {customer.displayName || 'Unknown User'}
                                                    </div>
                                                    {customer.tags && customer.tags.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                                            {customer.tags.slice(0, 2).map((tag, i) => (
                                                                <span key={i} style={{
                                                                    padding: '2px 6px',
                                                                    background: '#f0f0f0',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.7rem',
                                                                    color: '#666'
                                                                }}>
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                    <Mail size={14} />
                                                    {customer.email || 'N/A'}
                                                </div>
                                                {customer.phone && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Phone size={14} />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>
                                            {customer.totalOrders || 0}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.95rem', fontWeight: '600', color: '#2e7d32' }}>
                                            ${(customer.totalSpent || 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                background: segmentInfo.bg,
                                                color: segmentInfo.color,
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {segmentInfo.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                                            {customer.lastOrderDate ? customer.lastOrderDate.toLocaleDateString() : 'Never'}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => setSelectedCustomer(customer)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#667eea',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredCustomers.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        No customers found matching your criteria.
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}
                onClick={() => setSelectedCustomer(null)}
                >
                    <div 
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '30px',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
                            Customer Details
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Name</label>
                                <div style={{ fontSize: '1rem', color: '#333', fontWeight: '500' }}>{selectedCustomer.displayName || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Email</label>
                                <div style={{ fontSize: '1rem', color: '#333' }}>{selectedCustomer.email || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Total Orders</label>
                                <div style={{ fontSize: '1.2rem', color: '#333', fontWeight: 'bold' }}>{selectedCustomer.totalOrders || 0}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Total Spent</label>
                                <div style={{ fontSize: '1.2rem', color: '#2e7d32', fontWeight: 'bold' }}>${(selectedCustomer.totalSpent || 0).toLocaleString()}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Average Order Value</label>
                                <div style={{ fontSize: '1rem', color: '#333' }}>${selectedCustomer.averageOrderValue || 0}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Customer Segment</label>
                                <span style={{
                                    padding: '6px 12px',
                                    background: getSegmentColor(selectedCustomer.segment).bg,
                                    color: getSegmentColor(selectedCustomer.segment).color,
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    display: 'inline-block'
                                }}>
                                    {getSegmentColor(selectedCustomer.segment).label}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedCustomer(null)}
                            style={{
                                marginTop: '24px',
                                padding: '12px 24px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                width: '100%'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
