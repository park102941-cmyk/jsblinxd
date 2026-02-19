import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, CheckCircle, Truck, MapPin, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';

const statusConfig = {
    'delivered':    { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    '배송완료':     { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    'shipping':     { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    '배송중':       { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    'preparing':    { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    '발주완료':     { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    'pending':      { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
    'default':      { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
};

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();

    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [myOrders, setMyOrders] = useState([]);     // logged-in user's all orders
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myOrdersLoading, setMyOrdersLoading] = useState(false);
    const [error, setError] = useState('');

    // If logged in, auto-load all user orders
    useEffect(() => {
        if (currentUser) {
            setMyOrdersLoading(true);
            const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
            getDocs(q).then(snap => {
                const orders = snap.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        orderId: data.orderId,
                        status: data.status || 'pending',
                        total: data.totals?.total || 0,
                        trackingNumber: data.trackingNumber || '',
                        carrier: data.carrier || '',
                        items: data.items || [],
                        date: data.createdAt,
                        shippingAddress: data.shippingInfo,
                        pointsEarned: data.pointsEarned || 0,
                    };
                }).sort((a, b) => new Date(b.date) - new Date(a.date));
                setMyOrders(orders);
                // Auto-select if URL has an order ID
                const urlId = searchParams.get('id');
                if (urlId) {
                    const found = orders.find(o => o.orderId === urlId);
                    if (found) setSelectedOrder(found);
                }
            }).catch(console.error).finally(() => setMyOrdersLoading(false));
        } else {
            // Not logged in - auto-fill from URL params and search
            const urlId = searchParams.get('id');
            const urlEmail = searchParams.get('email');
            if (urlId) setOrderId(urlId);
            if (urlEmail) setEmail(urlEmail);
            if (urlId && urlEmail) handleTrack(null, urlId, urlEmail);
        }
    }, [currentUser]);

    // Manual tracking for guests
    const handleTrack = async (e, idOverride, emailOverride) => {
        if (e) e.preventDefault();
        const targetId = idOverride || orderId;
        const targetEmail = emailOverride || email;
        if (!targetId || !targetEmail) { setError('Please enter both Order ID and Email.'); return; }
        setLoading(true); setError(''); setOrderData(null);
        try {
            const snap = await getDocs(query(collection(db, 'orders'), where('orderId', '==', targetId.trim())));
            if (snap.empty) { setError('Order not found. Please check your Order ID.'); return; }
            let found = null;
            snap.forEach(d => {
                const data = d.data();
                const orderEmail = data.userInfo?.email || data.shippingInfo?.email || '';
                if (orderEmail.toLowerCase().trim() === targetEmail.toLowerCase().trim()) found = data;
            });
            if (found) {
                setOrderData({
                    id: found.orderId, status: found.status || 'pending',
                    total: found.totals?.total || 0, trackingNumber: found.trackingNumber || '',
                    carrier: found.carrier || '', items: found.items || [],
                    date: found.createdAt, shippingAddress: found.shippingInfo,
                    pointsEarned: found.pointsEarned || 0,
                });
            } else {
                setError('Order found, but email does not match.');
            }
        } catch (err) {
            setError('Unable to track at this time. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStepStatus = (status) => {
        if (!status) return 1;
        const s = status.toLowerCase().trim();
        if (s === 'delivered' || s === '배송완료') return 4;
        if (s === 'shipping' || s === '배송중') return 3;
        if (s === 'preparing' || s === '발주완료') return 2;
        return 1;
    };

    const OrderDetail = ({ order }) => {
        const sc = statusConfig[order.status?.toLowerCase()] || statusConfig.default;
        const step = getStepStatus(order.status);
        return (
            <div style={{ animation: 'fadeIn 0.4s', border: '1px solid #e5e5e5', borderRadius: '16px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                {/* Header */}
                <div style={{ padding: '24px 28px', background: 'linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Order ID</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'monospace' }}>#{order.orderId || order.id}</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                                {order.date ? new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}
                            </div>
                            {order.shippingAddress && (
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                                    📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                                </div>
                            )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>${Number(order.total).toFixed(2)}</div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '4px 12px', borderRadius: '20px', background: sc.bg, color: sc.color, fontSize: '0.8rem', fontWeight: '700' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot }} />
                                {order.status || 'Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '28px' }}>
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '36px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '24px', left: '12%', right: '12%', height: '3px', background: '#f0f0f0', zIndex: 0 }} />
                            <div style={{ position: 'absolute', top: '24px', left: '12%', width: `${((step - 1) / 3) * 76}%`, height: '3px', background: '#0071e3', zIndex: 0, transition: 'width 0.6s ease' }} />
                            {[
                                { label: 'Confirmed', icon: <CheckCircle size={20} /> },
                                { label: 'Preparing', icon: <Package size={20} /> },
                                { label: 'Shipped', icon: <Truck size={20} /> },
                                { label: 'Delivered', icon: <MapPin size={20} /> }
                            ].map((s, i) => {
                                const done = i + 1 <= step;
                                const cur = i + 1 === step;
                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: done ? '#0071e3' : '#f0f0f0', color: done ? 'white' : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: cur ? '0 0 0 6px rgba(0,113,227,0.15)' : 'none', transition: 'all 0.3s' }}>
                                            {s.icon}
                                        </div>
                                        <span style={{ fontSize: '0.78rem', fontWeight: done ? '600' : '400', color: done ? '#1d1d1f' : '#aaa' }}>{s.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                        <div style={{ padding: '16px 20px', background: '#eff6ff', borderRadius: '12px', border: '1.5px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0 }}>
                                <Truck size={22} color="#3b82f6" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Tracking Number</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1d4ed8' }}>{order.trackingNumber}</div>
                                {order.carrier && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>via {order.carrier}</div>}
                            </div>
                        </div>
                    )}

                    {/* Points earned */}
                    {order.pointsEarned > 0 && (
                        <div style={{ padding: '12px 16px', background: '#fefce8', borderRadius: '10px', border: '1.5px solid #fde047', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ fontSize: '0.875rem', color: '#713f12', fontWeight: '500' }}>⭐ Points earned from this order</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#d97706' }}>+{order.pointsEarned.toFixed(1)} pts</span>
                        </div>
                    )}

                    {/* Order Items */}
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1d1d1f', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items in this order</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '14px', padding: '14px', background: '#f9fafb', borderRadius: '10px', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#e5e5e5', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.product?.imageUrl ? (
                                        <img src={item.product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : <Package color="#ccc" size={24} style={{ margin: '18px' }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: '#1d1d1f', fontSize: '0.9rem' }}>{item.product?.title || 'Product'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6e6e73', marginTop: '2px' }}>Qty: {item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: '700', color: '#1d1d1f' }}>${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ── LOGGED-IN VIEW ──
    if (currentUser) {
        return (
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 20px 80px', minHeight: '60vh' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1d1d1f', marginBottom: '8px' }}>Track Orders</h1>
                <p style={{ color: '#6e6e73', marginBottom: '36px' }}>All your orders in one place</p>

                {myOrdersLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e5e5', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        <p style={{ color: '#6e6e73' }}>Loading your orders...</p>
                    </div>
                ) : myOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                        <h3 style={{ color: '#1d1d1f', marginBottom: '8px' }}>No orders yet</h3>
                        <Link to="/products" style={{ display: 'inline-block', marginTop: '16px', padding: '12px 24px', borderRadius: '10px', background: '#0071e3', color: 'white', textDecoration: 'none', fontWeight: '600' }}>
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '300px 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
                        {/* Order List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {myOrders.map(order => {
                                const sc = statusConfig[order.status?.toLowerCase()] || statusConfig.default;
                                const isSelected = selectedOrder?.orderId === order.orderId;
                                return (
                                    <div key={order.id} onClick={() => setSelectedOrder(isSelected ? null : order)}
                                        style={{ padding: '16px 18px', borderRadius: '12px', border: isSelected ? '2px solid #0071e3' : '2px solid #e5e5e5', background: isSelected ? '#eff6ff' : 'white', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isSelected ? '0 4px 12px rgba(0,113,227,0.15)' : '0 2px 6px rgba(0,0,0,0.04)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#6e6e73' }}>
                                                #{(order.orderId || order.id)?.slice(-8)}
                                            </span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '14px', background: sc.bg, color: sc.color, fontSize: '0.72rem', fontWeight: '700' }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.dot }} />
                                                {order.status || 'Pending'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#1d1d1f', fontWeight: '600', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.items[0]?.product?.title || 'Order'}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.78rem', color: '#6e6e73' }}>
                                                {order.date ? new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                            </span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1d1d1f' }}>${Number(order.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Detail */}
                        {selectedOrder && <OrderDetail order={selectedOrder} />}
                    </div>
                )}
                <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            </div>
        );
    }

    // ── GUEST VIEW ──
    return (
        <div style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto', minHeight: '60vh' }}>
            <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', color: '#1d1d1f', marginBottom: '8px' }}>Track Your Order</h1>
            <p style={{ textAlign: 'center', color: '#6e6e73', marginBottom: '36px' }}>
                Enter your Order ID and Email to see your order status. <Link to="/login" style={{ color: '#0071e3', fontWeight: '600' }}>Sign in</Link> to see all orders instantly.
            </p>

            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
                <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>Order ID</label>
                        <input type="text" placeholder="e.g. 1708000000000" required value={orderId} onChange={e => setOrderId(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', border: '2px solid #e5e5e5', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={e => e.target.style.borderColor = '#0071e3'} onBlur={e => e.target.style.borderColor = '#e5e5e5'} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>Email Address</label>
                        <input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px', border: '2px solid #e5e5e5', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={e => e.target.style.borderColor = '#0071e3'} onBlur={e => e.target.style.borderColor = '#e5e5e5'} />
                    </div>
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fff0f0', borderRadius: '8px', color: '#d32f2f', fontSize: '0.875rem' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: '12px', border: 'none', background: '#0071e3', color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Searching...' : 'Track Order →'}
                    </button>
                </form>
            </div>

            {orderData && <OrderDetail order={orderData} />}
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default TrackOrder;
