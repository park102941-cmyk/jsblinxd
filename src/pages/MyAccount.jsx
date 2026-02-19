import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile, deleteUser } from 'firebase/auth';

const statusConfig = {
    'Order Received':   { bg: '#e0f2fe', color: '#0369a1', dot: '#0ea5e9' },
    'Processing':       { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    'Shipped':          { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    'Delivered':        { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
    'Cancelled':        { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    'default':          { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
};

const MyAccount = () => {
    const { currentUser, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    useEffect(() => {
        if (!currentUser) { navigate('/login'); return; }
        const fetchData = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                    setNewName(userDoc.data().displayName || currentUser.displayName || '');
                } else {
                    setNewName(currentUser.displayName || '');
                }
                const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
                const snap = await getDocs(q);
                const myOrders = snap.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        orderId: data.orderId,
                        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                        product: data.items?.map(i => i.product?.title).join(', ') || '-',
                        price: data.totals?.total,
                        status: data.status,
                        trackingNumber: data.trackingNumber,
                        email: data.userInfo?.email || data.shippingInfo?.email || currentUser.email
                    };
                }).sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(myOrders);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleUpdateProfile = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            await updateProfile(currentUser, { displayName: newName });
            await updateDoc(doc(db, 'users', currentUser.uid), { displayName: newName });
            setUserData(prev => ({ ...prev, displayName: newName }));
            setIsEditing(false);
            setSaveMsg('Profile updated!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid));
            await deleteUser(currentUser);
            navigate('/');
        } catch (e) {
            if (e.code === 'auth/requires-recent-login') {
                alert('Please log out and log back in before deleting your account.');
            }
        }
    };

    const removeFavorite = async (fav) => {
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), { favorites: arrayRemove(fav) });
            setUserData(prev => ({ ...prev, favorites: prev.favorites.filter(f => f.id !== fav.id) }));
        } catch (e) { console.error(e); }
    };

    if (loading) return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid #e5e5e5', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#6e6e73' }}>Loading your account...</p>
            </div>
        </div>
    );

    const displayName = userData?.displayName || currentUser?.displayName || 'User';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'orders', label: `Orders (${orders.length})`, icon: '📦' },
        { id: 'favorites', label: `Favorites (${userData?.favorites?.length || 0})`, icon: '❤️' },
        { id: 'cart', label: `Cart (${cartItems.length})`, icon: '🛒' },
    ];

    return (
        <div style={{ background: '#f5f5f7', minHeight: '100vh' }}>
            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 50%, #1a1a2e 100%)',
                padding: '48px 24px 80px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(0,113,227,0.1)' }} />

                <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: currentUser?.photoURL ? 'transparent' : 'linear-gradient(135deg, #0071e3, #0056b0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: '700', color: 'white',
                        border: '3px solid rgba(255,255,255,0.2)',
                        overflow: 'hidden', flexShrink: 0
                    }}>
                        {currentUser?.photoURL
                            ? <img src={currentUser.photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : initials}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '700', margin: '0 0 4px' }}>
                            Hello, {displayName.split(' ')[0]} 👋
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.95rem' }}>
                            {currentUser?.email}
                        </p>
                    </div>
                    <button onClick={handleLogout} style={{
                        padding: '10px 20px', borderRadius: '10px',
                        border: '1.5px solid rgba(255,255,255,0.25)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white', fontSize: '0.9rem', fontWeight: '500',
                        cursor: 'pointer', backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                        Sign Out
                    </button>
                </div>

                {/* Stats row */}
                <div style={{ maxWidth: '960px', margin: '32px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', position: 'relative' }}>
                    {[
                        { label: 'Total Orders', value: orders.length },
                        { label: 'Favorites', value: userData?.favorites?.length || 0 },
                        { label: 'Cart Items', value: cartItems.length },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: 'rgba(255,255,255,0.07)',
                            borderRadius: '14px', padding: '16px 20px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs + Content */}
            <div style={{ maxWidth: '960px', margin: '-32px auto 0', padding: '0 24px 60px', position: 'relative' }}>
                {/* Tab bar */}
                <div style={{
                    background: 'white', borderRadius: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    display: 'flex', overflow: 'hidden',
                    marginBottom: '24px', border: '1px solid #f0f0f0'
                }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            flex: 1, padding: '16px 12px',
                            border: 'none', background: activeTab === tab.id
                                ? 'linear-gradient(135deg, #0071e3, #0056b0)'
                                : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#6e6e73',
                            fontSize: '0.875rem', fontWeight: activeTab === tab.id ? '600' : '500',
                            cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                            <span style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── PROFILE TAB ── */}
                {activeTab === 'profile' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Profile info card */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', gridColumn: 'span 1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1d1d1f' }}>Profile Information</h2>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} style={{
                                        padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #0071e3',
                                        background: 'transparent', color: '#0071e3', fontSize: '0.85rem',
                                        fontWeight: '600', cursor: 'pointer'
                                    }}>Edit</button>
                                )}
                            </div>
                            {isEditing ? (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#6e6e73', marginBottom: '6px' }}>Display Name</label>
                                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '2px solid #e5e5e5', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' }}
                                        onFocus={e => e.target.style.borderColor = '#0071e3'}
                                        onBlur={e => e.target.style.borderColor = '#e5e5e5'}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={handleUpdateProfile} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#0071e3', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button onClick={() => setIsEditing(false)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e5e5e5', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {saveMsg && <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#d1fae5', color: '#065f46', fontSize: '0.875rem', fontWeight: '500' }}>✓ {saveMsg}</div>}
                                    {[
                                        { label: 'Name', value: displayName },
                                        { label: 'Email', value: currentUser?.email },
                                        { label: 'Member since', value: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-' },
                                        { label: 'Sign-in method', value: userData?.provider === 'google' ? '🔵 Google' : userData?.provider === 'facebook' ? '🔷 Facebook' : '📧 Email' },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '16px', borderBottom: '1px solid #f5f5f7' }}>
                                            <span style={{ fontSize: '0.78rem', color: '#6e6e73', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                                            <span style={{ fontSize: '0.95rem', color: '#1d1d1f', fontWeight: '500' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Coupon card */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: '700', color: '#1d1d1f' }}>My Coupons</h2>
                            <div style={{
                                background: 'linear-gradient(135deg, #0071e3 0%, #0056b0 100%)',
                                borderRadius: '12px', padding: '20px',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                                <div style={{ position: 'absolute', right: '20px', bottom: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '8px' }}>WELCOME OFFER</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', letterSpacing: '0.05em', marginBottom: '4px' }}>WELCOME10</div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>10% off your first order</div>
                            </div>
                        </div>

                        {/* Danger zone */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', gridColumn: 'span 2', borderLeft: '4px solid #fee2e2' }}>
                            <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#991b1b', fontWeight: '700' }}>Danger Zone</h3>
                            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#6e6e73' }}>Permanently delete your account and all associated data.</p>
                            <button onClick={handleDeleteAccount} style={{
                                padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #ef4444',
                                background: 'transparent', color: '#ef4444', fontWeight: '600',
                                fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

                {/* ── ORDERS TAB ── */}
                {activeTab === 'orders' && (
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 28px', borderBottom: '1px solid #f5f5f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1d1d1f' }}>Order History</h2>
                            <Link to="/track-order" style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e5e5', color: '#1d1d1f', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
                                Track Order ↗
                            </Link>
                        </div>
                        {orders.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                                <h3 style={{ color: '#1d1d1f', marginBottom: '8px' }}>No orders yet</h3>
                                <p style={{ color: '#6e6e73', marginBottom: '24px' }}>Your order history will appear here</p>
                                <Link to="/products" style={{ padding: '12px 24px', borderRadius: '10px', background: '#0071e3', color: 'white', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>
                                    Shop Now
                                </Link>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb' }}>
                                            {['Date', 'Order #', 'Products', 'Total', 'Status', ''].map(h => (
                                                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, i) => {
                                            const sc = statusConfig[order.status] || statusConfig.default;
                                            return (
                                                <tr key={i} style={{ borderTop: '1px solid #f5f5f7', transition: 'background 0.15s' }}
                                                    onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#6e6e73', whiteSpace: 'nowrap' }}>{order.date}</td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#f5f5f7', padding: '4px 8px', borderRadius: '6px', color: '#1d1d1f' }}>
                                                            {order.orderId || order.id?.slice(0,8)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#1d1d1f', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.product}</td>
                                                    <td style={{ padding: '16px 20px', fontSize: '0.95rem', fontWeight: '700', color: '#1d1d1f', whiteSpace: 'nowrap' }}>
                                                        {order.price ? `$${Number(order.price).toLocaleString()}` : '-'}
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: sc.bg, color: sc.color, fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                                                            {order.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <Link to={`/track-order?id=${order.orderId}&email=${order.email}`}
                                                            style={{ color: '#0071e3', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                                            {order.trackingNumber ? 'Track ↗' : 'View ↗'}
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── FAVORITES TAB ── */}
                {activeTab === 'favorites' && (
                    <div>
                        {!userData?.favorites || userData.favorites.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❤️</div>
                                <h3 style={{ color: '#1d1d1f', marginBottom: '8px' }}>No favorites yet</h3>
                                <p style={{ color: '#6e6e73', marginBottom: '24px' }}>Save products you love by clicking the heart icon</p>
                                <Link to="/products" style={{ padding: '12px 24px', borderRadius: '10px', background: '#0071e3', color: 'white', textDecoration: 'none', fontWeight: '600' }}>
                                    Browse Products
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                {userData.favorites.map((fav, i) => (
                                    <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}>
                                        <Link to={`/product/${fav.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ height: '180px', background: '#f5f5f7', overflow: 'hidden' }}>
                                                {fav.image && <img src={fav.image} alt={fav.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />}
                                            </div>
                                            <div style={{ padding: '14px' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fav.title}</h4>
                                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0071e3' }}>${fav.price}</div>
                                            </div>
                                        </Link>
                                        <button onClick={() => removeFavorite(fav)} style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            border: 'none', background: 'rgba(255,255,255,0.95)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '0.75rem', color: '#ef4444'
                                        }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── CART TAB ── */}
                {activeTab === 'cart' && (
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 28px', borderBottom: '1px solid #f5f5f7' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1d1d1f' }}>Shopping Cart ({cartItems.length})</h2>
                        </div>
                        {cartItems.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
                                <h3 style={{ color: '#1d1d1f', marginBottom: '8px' }}>Your cart is empty</h3>
                                <p style={{ color: '#6e6e73', marginBottom: '24px' }}>Add items to get started</p>
                                <Link to="/products" style={{ padding: '12px 24px', borderRadius: '10px', background: '#0071e3', color: 'white', textDecoration: 'none', fontWeight: '600' }}>
                                    Shop Now
                                </Link>
                            </div>
                        ) : (
                            <div>
                                <div style={{ padding: '8px 0' }}>
                                    {cartItems.map((item, i) => (
                                        <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '20px 28px', borderBottom: i < cartItems.length - 1 ? '1px solid #f5f5f7' : 'none', alignItems: 'center' }}>
                                            <div style={{ width: '72px', height: '72px', borderRadius: '12px', background: '#f5f5f7', overflow: 'hidden', flexShrink: 0 }}>
                                                {item.product?.images?.[0] && <img src={item.product.images[0]} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.title}</h3>
                                                <p style={{ fontSize: '0.8rem', color: '#6e6e73', margin: 0 }}>
                                                    {item.options?.fabric?.name || item.selectedColor}
                                                    {item.options?.measurements && ` · ${item.options.measurements.width}"×${item.options.measurements.height}"`}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1d1d1f' }}>${(item.price * item.quantity).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#6e6e73' }}>Qty: {item.quantity}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '20px 28px', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Link to="/checkout" style={{
                                        padding: '13px 28px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #0071e3, #0056b0)',
                                        color: 'white', textDecoration: 'none',
                                        fontWeight: '700', fontSize: '0.95rem'
                                    }}>
                                        Proceed to Checkout →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default MyAccount;
