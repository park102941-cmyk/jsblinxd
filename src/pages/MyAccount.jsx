import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile, deleteUser } from 'firebase/auth';

const MyAccount = () => {
    const { currentUser, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Fetch User Data from Firestore
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                    setNewName(userDoc.data().displayName || currentUser.displayName || '');
                } else {
                    setNewName(currentUser.displayName || '');
                }

                // 2. Fetch Orders from Firestore (Central Source for Orders)
                const ordersRef = collection(db, "orders");
                // Simplified query by User ID since we save it
                const q = query(ordersRef, where("userId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);

                const myOrders = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    // Flatten items for display if needed, or just show summary
                    // For the table, we'll show one row per order, or maybe expand
                    // The previous code showed 1 row per item roughly (from GAS). 
                    // Let's keep it simple: One row per Order.
                    return {
                        id: doc.id,
                        orderId: data.orderId,
                        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
                        product: data.items.map(i => i.product.title).join(', '), // Summary of products
                        price: data.totals.total,
                        status: data.status,
                        trackingNumber: data.trackingNumber,
                        email: data.userInfo?.email || data.shippingInfo?.email || currentUser.email
                    };
                });

                // Sort by latest (client side sort is fine for user's own orders)
                myOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(myOrders);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleUpdateProfile = async () => {
        if (!newName.trim()) return;
        try {
            // Update Auth Profile
            await updateProfile(currentUser, { displayName: newName });

            // Update Firestore
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { displayName: newName });

            // Update Local State
            setUserData(prev => ({ ...prev, displayName: newName }));
            setIsEditing(false);
            alert('Profile updated successfully.');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('Failed to update profile.');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                // Delete Firestore Data first (optional but good practice)
                await deleteDoc(doc(db, "users", currentUser.uid));

                // Delete Auth User
                await deleteUser(currentUser);

                alert('Account deleted.');
                navigate('/');
            } catch (error) {
                console.error("Error deleting account:", error);
                if (error.code === 'auth/requires-recent-login') {
                    alert('For security, please logout and login again before deleting your account.');
                } else {
                    alert('Failed to delete account. ' + error.message);
                }
            }
        }
    };

    if (loading) return <div className="container section">Loading...</div>;

    return (
        <div className="container section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className="section-title" style={{ margin: 0 }}>My Account</h1>
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Profile Card */}
                <div style={{ padding: '20px', background: 'var(--white)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Profile Info</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} style={{ fontSize: '0.8rem', padding: '5px 10px', cursor: 'pointer' }}>Edit</button>
                        )}
                    </div>

                    {isEditing ? (
                        <div>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleUpdateProfile} className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>Save</button>
                                <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p><strong>Name:</strong> {userData?.displayName || currentUser?.displayName || 'User'}</p>
                            <p><strong>Email:</strong> {currentUser?.email}</p>
                            <p><strong>Joined:</strong> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                    )}

                    <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <button onClick={handleDeleteAccount} style={{ color: 'white', background: 'black', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>
                            Delete Account
                        </button>
                    </div>
                </div>

                {/* Coupon Card */}
                <div style={{ padding: '20px', background: 'var(--white)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>My Coupons</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid var(--accent-color)' }}>
                            <strong>WELCOME10</strong>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>10% OFF for New Users</p>
                        </div>
                    </div>
                </div>
                {/* Active Cart Section */}
                <div style={{ marginTop: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Your Cart ({cartItems.length})</h2>
                    {cartItems.length === 0 ? (
                        <div style={{ padding: '30px', background: '#fff', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)', textAlign: 'center' }}>
                            <p style={{ marginBottom: '15px' }}>Your cart is empty.</p>
                            <Link to="/" className="btn btn-primary">Start Shopping</Link>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--white)', padding: '20px', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }}>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {cartItems.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                                        <div style={{ width: '80px', height: '80px', background: '#f5f5f5', borderRadius: '8px' }}>
                                            {item.product.images?.[0] && <img src={item.product.images[0]} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{item.product.title}</h3>
                                            {/* Display key options */}
                                            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                                {item.options?.fabric?.name || item.selectedColor}
                                                {item.options?.measurements && ` / ${item.options.measurements.width}"x${item.options.measurements.height}"`}
                                            </p>
                                            <div style={{ marginTop: '10px', fontWeight: 'bold' }}>${item.price} x {item.quantity}</div>
                                        </div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <Link to="/checkout" className="btn btn-primary">Proceed to Checkout</Link>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Favorites Section */}
            <div style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>My Favorites</h2>
                {!userData?.favorites || userData.favorites.length === 0 ? (
                    <div style={{ padding: '40px', background: '#f9f9f9', textAlign: 'center', borderRadius: 'var(--border-radius)' }}>
                        No favorite items yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {userData.favorites.map((fav, index) => (
                            <div key={index} style={{ background: 'white', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                <Link to={`/product/${fav.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ height: '200px', background: '#f5f5f5' }}>
                                        {fav.image && <img src={fav.image} alt={fav.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <div style={{ padding: '15px' }}>
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fav.title}</h4>
                                        <div style={{ fontWeight: 'bold' }}>${fav.price}</div>
                                    </div>
                                </Link>
                                <button
                                    onClick={async () => {
                                        if (window.confirm("Remove from favorites?")) {
                                            try {
                                                const userRef = doc(db, "users", currentUser.uid);
                                                await updateDoc(userRef, {
                                                    favorites: arrayRemove(fav)
                                                });
                                                // Update local state by filtering out the removed item
                                                setUserData(prev => ({
                                                    ...prev,
                                                    favorites: prev.favorites.filter(f => f.id !== fav.id) // Simple ID filter might be safer assuming unique products
                                                }));
                                            } catch (error) {
                                                console.error("Error removing favorite:", error);
                                            }
                                        }
                                    }}
                                    style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                                        width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order History */}
            <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Order History</h2>
                    <Link to="/track-order" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.9rem', padding: '8px 16px' }}>
                        Go to Tracking Page
                    </Link>
                </div>
                {orders.length === 0 ? (
                    <div style={{ padding: '40px', background: '#f9f9f9', textAlign: 'center', borderRadius: 'var(--border-radius)' }}>
                        No order history.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead style={{ background: '#f5f5f7' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.9rem', color: '#666' }}>Date</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.9rem', color: '#666' }}>Order #</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.9rem', color: '#666' }}>Product</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.9rem', color: '#666' }}>Total</th>
                                    <th style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>Status</th>
                                    <th style={{ padding: '15px', textAlign: 'left', fontSize: '0.9rem', color: '#666' }}>Tracking</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px', fontSize: '0.9rem' }}>{order.date}</td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem', fontFamily: 'monospace' }}>{order.orderId}</td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem' }}>{order.product}</td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                            {order.price ? `$${Number(order.price).toLocaleString()}` : '-'}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                background: order.status === 'Order Received' ? '#e3f2fd' : '#f5f5f5',
                                                color: order.status === 'Order Received' ? '#1565c0' : '#333',
                                                border: '1px solid transparent',
                                                borderColor: order.status === 'Order Received' ? '#bbdefb' : '#eee'
                                            }}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                                            <Link
                                                to={`/track-order?id=${order.orderId}&email=${order.email}`}
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-green)', textDecoration: 'none', fontWeight: '500' }}
                                            >
                                                {order.trackingNumber ? (
                                                    <>Track Package <span style={{ fontSize: '1em' }}>↗</span></>
                                                ) : (
                                                    <span style={{ color: '#666' }}>View Status</span>
                                                )}
                                            </Link>
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

export default MyAccount;
