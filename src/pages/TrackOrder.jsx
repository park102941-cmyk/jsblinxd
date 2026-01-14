import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle, Truck, MapPin, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-fill from URL if present
    useEffect(() => {
        const urlId = searchParams.get('id');
        const urlEmail = searchParams.get('email');
        if (urlId) setOrderId(urlId);
        if (urlEmail) setEmail(urlEmail);

        if (urlId && urlEmail) {
            handleTrack(null, urlId, urlEmail);
        }
    }, [searchParams]);

    const handleTrack = async (e, idOverride, emailOverride) => {
        if (e) e.preventDefault();

        const targetId = idOverride || orderId;
        const targetEmail = emailOverride || email;

        if (!targetId || !targetEmail) {
            setError("Please enter both Order ID and Email.");
            return;
        }

        setLoading(true);
        setError('');
        setOrderData(null);

        try {
            // 1. Query Firestore for Order ID
            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, where("orderId", "==", targetId.toString().trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError("Order not found. Please check your Order ID.");
                setLoading(false);
                return;
            }

            // 2. Client-side Verify Email (for security and simplicity vs composite indexes)
            let foundOrder = null;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const orderEmail = data.userInfo?.email || data.shippingInfo?.email || '';

                if (orderEmail.toLowerCase().trim() === targetEmail.toLowerCase().trim()) {
                    foundOrder = data;
                }
            });

            if (foundOrder) {
                setOrderData({
                    id: foundOrder.orderId,
                    status: foundOrder.status || 'pending',
                    total: foundOrder.totals?.total || 0,
                    trackingNumber: foundOrder.trackingNumber || '',
                    carrier: foundOrder.carrier || '',
                    items: foundOrder.items || [],
                    date: foundOrder.createdAt,
                    shippingAddress: foundOrder.shippingInfo
                });
            } else {
                setError("Order found, but email does not match.");
            }

        } catch (err) {
            console.error("Tracking Error:", err);
            setError("Unable to track at this time. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine active step
    const getStepStatus = (status) => {
        if (!status) return 1;
        const s = status.toLowerCase().trim();

        // 1: Order Placed (paid/pending)
        // 2: Preparing (preparing/발주완료)
        // 3: Shipped (shipping/배송중)
        // 4: Delivered (delivered/배송완료)

        if (s === 'delivered' || s === '배송완료') return 4;
        if (s === 'shipping' || s === '배송중') return 3;
        if (s === 'preparing' || s === '발주완료') return 2;

        return 1; // Default to 'Order Placed'
    };

    return (
        <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Track Your Order</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
                Enter your Order ID and Email Address to see your order status.
            </p>

            <div style={{ background: '#f9f9fb', padding: '30px', borderRadius: '12px', marginBottom: '40px' }}>
                <form onSubmit={(e) => handleTrack(e)} style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr auto' }}>
                    <input
                        type="text"
                        placeholder="Order ID"
                        required
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ padding: '0 30px', borderRadius: '6px' }}
                    >
                        {loading ? 'Searching...' : 'Track'}
                    </button>
                </form>
                {error && <div style={{ color: '#E53935', marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertCircle size={18} /> {error}</div>}
            </div>

            {orderData && (
                <div style={{ animation: 'fadeIn 0.5s' }}>
                    <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '30px', marginBottom: '30px', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Order #{orderData.id}</h3>
                                <p style={{ color: '#666', margin: '5px 0 0 0' }}>Placed on {new Date(orderData.date).toLocaleDateString()}</p>
                                {orderData.shippingAddress && (
                                    <p style={{ color: '#888', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                                        Shipped to: {orderData.shippingAddress.city}, {orderData.shippingAddress.state}
                                    </p>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>${Number(orderData.total).toLocaleString()}</div>
                                <div style={{
                                    display: 'inline-block',
                                    marginTop: '5px',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: '#e3f2fd',
                                    color: '#1565c0',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                }}>
                                    {orderData.status}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '40px', marginTop: '40px' }}>
                            {/* Line */}
                            <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '3px', background: '#f0f0f0', zIndex: 0 }}></div>
                            <div style={{
                                position: 'absolute',
                                top: '24px',
                                left: '10%',
                                width: `${((getStepStatus(orderData.status) - 1) / 3) * 80}%`,
                                height: '3px',
                                background: 'var(--secondary-color)',
                                zIndex: 0,
                                transition: 'width 0.5s ease'
                            }}></div>

                            {[
                                { label: 'Order Confirmed', icon: <CheckCircle /> },
                                { label: 'Preparing', icon: <Package /> },
                                { label: 'Shipped', icon: <Truck /> },
                                { label: 'Delivered', icon: <MapPin /> }
                            ].map((step, index) => {
                                const currentStepIndex = getStepStatus(orderData.status);
                                const isCompleted = index + 1 <= currentStepIndex;
                                const isCurrent = index + 1 === currentStepIndex;

                                return (
                                    <div key={index} style={{ textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: isCompleted ? 'var(--secondary-color)' : '#f0f0f0',
                                            color: isCompleted ? 'white' : '#ccc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: isCurrent ? '0 0 0 5px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {step.icon}
                                        </div>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            fontWeight: isCompleted ? '600' : 'normal',
                                            color: isCompleted ? '#333' : '#999',
                                            marginTop: '5px'
                                        }}>
                                            {step.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tracking Info if available */}
                        {orderData.trackingNumber && (
                            <div style={{ background: '#f0f7ff', padding: '20px', borderRadius: '8px', border: '1px solid #cce5ff', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: '#fff', padding: '10px', borderRadius: '50%' }}>
                                    <Truck size={24} color="#007bff" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tracking Number</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>{orderData.trackingNumber}</div>
                                    {orderData.carrier && <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '2px' }}>via {orderData.carrier}</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Items Summary */}
                    <div style={{ marginBottom: '60px' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#333' }}>Order Items</h3>
                        {orderData.items && orderData.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '20px', marginBottom: '15px', border: '1px solid #eee', borderRadius: '8px', padding: '15px', background: 'white' }}>
                                <div style={{ width: '70px', height: '70px', background: '#f8f8f8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.product?.imageUrl ? (
                                        <img src={item.product?.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                    ) : (
                                        <Package color="#ddd" size={24} />
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#333' }}>{item.product?.title || item.title || 'Product'}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                        Qty: {item.quantity} | ${item.price}
                                    </div>
                                    {/* Show options if any (like color, size) */}
                                    {(item.selectedColor || item.width) && (
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '6px' }}>
                                            {item.selectedColor} {item.width ? `(${item.width}" x ${item.height}")` : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;
