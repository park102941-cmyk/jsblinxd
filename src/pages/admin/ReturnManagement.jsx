import React, { useState, useEffect } from 'react';
import { ExternalLink, Sheet, RefreshCcw, AlertCircle, Package, Truck, Search, ArrowLeftRight } from 'lucide-react';
import { GOOGLE_SCRIPT_URL } from '../../lib/config';

const ReturnManagement = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReturns = async () => {
        setLoading(true);
        setError(null);

        if (GOOGLE_SCRIPT_URL.includes('PLACEHOLDER')) {
            setLoading(false);
            setError('Please configure the Google Apps Script URL in src/lib/config.js');
            return;
        }

        try {
            // Fetch with type=returns
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=returns`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            const sortedData = Array.isArray(data) ? data.reverse() : [];
            setReturns(sortedData);
        } catch (err) {
            console.error("Fetch error:", err);
            setError('Failed to load returns. Please check your Google Script deployment.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('refunded') || s.includes('환불')) return '#e3f2fd'; // Blue
        if (s.includes('approved') || s.includes('승인')) return '#e8f5e9'; // Green
        if (s.includes('requested')) return '#fff3e0'; // Orange
        return '#f5f5f7'; // Grey
    };

    const handleUpdateReturn = async (orderId, newStatus) => {
        if (!window.confirm(`Update status for ${orderId} to ${newStatus}?`)) return;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({
                    action: 'update_return',
                    orderId: orderId,
                    status: newStatus
                })
            });
            alert('Update sent! Refreshing list...');
            setTimeout(fetchReturns, 2000); // Wait for Spreadsheets to process
        } catch (e) {
            alert('Failed to update return status');
        }
    };

    // Filter
    const filteredReturns = returns.filter(item =>
        item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1d1d1f', margin: 0 }}>Return Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Search returns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '250px' }}
                        />
                    </div>
                    <button
                        onClick={fetchReturns}
                        className="btn-icon"
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                        title="Refresh"
                    >
                        <RefreshCcw size={20} color="#1d1d1f" />
                    </button>
                    <a
                        href="https://docs.google.com/spreadsheets/d/1O0RSagEwk8MlxN-Yslcw8F_N5cHzaoz7GJGwWVRfiT0/edit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{
                            background: '#ff9800',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                        }}
                    >
                        <Sheet size={18} /> Open Returns Sheet
                    </a>
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#86868b' }}>
                    <div className="loading-spinner" style={{ marginBottom: '15px' }}>Loading...</div>
                    <p>Loading Returns...</p>
                </div>
            )}

            {error && <div style={{ color: 'red', padding: '20px' }}>{error}</div>}

            {!loading && !error && (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e5e5e5' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f9f9fa', borderBottom: '1px solid #e5e5e5' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Order ID</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Customer</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Reason</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#666' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#666' }}>Refund</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#666' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReturns.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No return requests found.</td>
                                </tr>
                            ) : filteredReturns.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                                    <td style={{ padding: '12px 16px' }}>{item.date}</td>
                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{item.orderId}</td>
                                    <td style={{ padding: '12px 16px' }}>{item.customer}</td>
                                    <td style={{ padding: '12px 16px', maxWidth: '200px' }}>{item.reason}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{
                                            background: getStatusColor(item.status),
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#444'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>{item.refundAmount || '-'}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        {item.status === 'Requested' && (
                                            <button
                                                onClick={() => handleUpdateReturn(item.orderId, 'Approved')}
                                                style={{ marginRight: '5px', padding: '5px 10px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {item.status === 'Approved' && (
                                            <button
                                                onClick={() => handleUpdateReturn(item.orderId, 'Refunded')}
                                                style={{ padding: '5px 10px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Mark Refunded
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReturnManagement;
