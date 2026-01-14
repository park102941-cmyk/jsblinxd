import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { GOOGLE_SCRIPT_URL } from '../../lib/config';
import { Package, AlertTriangle, TrendingDown, RefreshCw, Plus, Edit, Trash2, Search, Download } from 'lucide-react';

const InventoryManagement = () => {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            // Fetch products from Firestore
            const productsSnapshot = await getDocs(collection(db, 'products'));
            const productsData = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);

            // Fetch inventory from Google Sheets
            let inventoryData = [];
            if (!GOOGLE_SCRIPT_URL.includes('PLACEHOLDER')) {
                const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=inventory`);
                if (response.ok) {
                    const data = await response.json();
                    inventoryData = Array.isArray(data) ? data : [];
                }
            }

            // Merge product and inventory data
            const mergedInventory = productsData.map(product => {
                const colors = product.colors || [];
                return colors.map(color => {
                    const inventoryItem = inventoryData.find(item => 
                        item.componentId === color.component_id
                    );
                    return {
                        productId: product.id,
                        productName: product.title,
                        colorName: color.name,
                        componentId: color.component_id,
                        currentStock: inventoryItem?.quantity || 0,
                        safetyStock: inventoryItem?.safetyStock || 10,
                        reorderPoint: inventoryItem?.reorderPoint || 20,
                        lastUpdated: inventoryItem?.lastUpdated || new Date().toISOString(),
                        status: getStockStatus(inventoryItem?.quantity || 0, inventoryItem?.safetyStock || 10)
                    };
                });
            }).flat();

            setInventory(mergedInventory);
        } catch (error) {
            console.error('Inventory fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (current, safety) => {
        if (current === 0) return 'out';
        if (current <= safety) return 'low';
        if (current <= safety * 2) return 'medium';
        return 'good';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'out': return { bg: '#ffebee', color: '#c62828', label: 'Out of Stock' };
            case 'low': return { bg: '#fff3e0', color: '#ef6c00', label: 'Low Stock' };
            case 'medium': return { bg: '#fff9c4', color: '#f57f17', label: 'Medium' };
            case 'good': return { bg: '#e8f5e9', color: '#2e7d32', label: 'In Stock' };
            default: return { bg: '#f5f5f5', color: '#666', label: 'Unknown' };
        }
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.colorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.componentId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: inventory.length,
        outOfStock: inventory.filter(i => i.status === 'out').length,
        lowStock: inventory.filter(i => i.status === 'low').length,
        inStock: inventory.filter(i => i.status === 'good' || i.status === 'medium').length
    };

    const exportToCSV = () => {
        const headers = ['Product', 'Color', 'Component ID', 'Current Stock', 'Safety Stock', 'Status'];
        const rows = filteredInventory.map(item => [
            item.productName,
            item.colorName,
            item.componentId,
            item.currentStock,
            item.safetyStock,
            getStatusColor(item.status).label
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return <div style={{ padding: '20px', color: '#666' }}>Loading inventory...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333', margin: 0 }}>Inventory Management</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={fetchInventory}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '10px 16px', 
                            background: '#fff', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button 
                        onClick={exportToCSV}
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
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Package size={24} color="#667eea" />
                        <h3 style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Total Items</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', margin: 0 }}>{stats.total}</p>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <AlertTriangle size={24} color="#c62828" />
                        <h3 style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Out of Stock</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#c62828', margin: 0 }}>{stats.outOfStock}</p>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <TrendingDown size={24} color="#ef6c00" />
                        <h3 style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Low Stock</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef6c00', margin: 0 }}>{stats.lowStock}</p>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Package size={24} color="#2e7d32" />
                        <h3 style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>In Stock</h3>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32', margin: 0 }}>{stats.inStock}</p>
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
                                placeholder="Search by product, color, or component ID..."
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['all', 'out', 'low', 'medium', 'good'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                style={{
                                    padding: '10px 16px',
                                    background: filterStatus === status ? '#667eea' : '#fff',
                                    color: filterStatus === status ? 'white' : '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {status === 'all' ? 'All' : getStatusColor(status).label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Product</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Color</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Component ID</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Current Stock</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Safety Stock</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((item, index) => {
                                const statusInfo = getStatusColor(item.status);
                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', color: '#333', fontWeight: '500' }}>{item.productName}</td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', color: '#666' }}>{item.colorName}</td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: '#999', fontFamily: 'monospace' }}>{item.componentId}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>{item.currentStock}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>{item.safetyStock}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                background: statusInfo.bg,
                                                color: statusInfo.color,
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button style={{ padding: '6px', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
                                                    <Edit size={16} color="#666" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredInventory.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        No inventory items found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryManagement;
