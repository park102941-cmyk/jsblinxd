import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { GOOGLE_SCRIPT_URL } from '../lib/config';

const Checkout = () => {
    const { cartItems, calculateTotals, coupon, applyCoupon } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const totals = calculateTotals();
    const [promoCode, setPromoCode] = useState('');

    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        detailAddress: '',
        city: '',
        state: '',
        zipCode: '',
        memo: ''
    });
    const [loading, setLoading] = useState(false);

    const US_STATES = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleZipChange = async (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
        setShippingInfo(prev => ({ ...prev, zipCode: val }));

        if (val.length === 5) {
            try {
                const res = await fetch(`https://api.zippopotam.us/us/${val}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.places && data.places.length > 0) {
                        const place = data.places[0];
                        setShippingInfo(prev => ({
                            ...prev,
                            zipCode: val,
                            city: place['place name'],
                            state: place['state abbreviation']
                        }));
                    }
                }
            } catch (err) {
                console.error("Zip fetch error", err);
            }
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order Data (Main Source of Truth: Firebase)
            const orderId = new Date().getTime().toString();

            // Determine email to save with order structure transparently
            const orderEmail = shippingInfo.email || (currentUser ? currentUser.email : '');

            const orderData = {
                orderId,
                userId: currentUser ? currentUser.uid : 'guest',
                userInfo: { email: orderEmail },
                items: cartItems,
                shippingInfo, // contains email too now
                totals,
                couponUsed: coupon ? coupon.code : null,
                status: 'pending', // pending -> paid -> preparing -> shipping -> delivered
                createdAt: new Date().toISOString()
            };

            // 2. Save to Firestore (Database)
            await addDoc(collection(db, "orders"), orderData);

            // 3. Send to Google Sheets (Inventory Management ONLY)
            try {
                const inventoryItems = cartItems.map(item => ({
                    id: item.product.id,
                    sku: item.product.id,
                    quantity: item.quantity
                }));

                const sheetPayload = {
                    action: 'process_order_inventory',
                    items: inventoryItems
                };

                // Use 'no-cors' mode
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sheetPayload)
                });
            } catch (sheetError) {
                console.error("Failed to sync inventory to Google Sheet", sheetError);
            }

            alert('Order Placed Successfully! Your Order ID is ' + orderId);
            // If logged in, go to account. If guest, maybe go to a success page? 
            // For now, let's go to account page (which handles guest view gracefully or redirects) 
            // - actually Account page might require auth. 
            // Ideally we need an Order Confirmation page. But let's stick to /account for now or redirect to /track-order?
            // Let's redirect to Track Order so they can see it immediately!
            navigate(`/track-order?id=${orderId}&email=${encodeURIComponent(orderEmail)}`);

        } catch (error) {
            console.error("Order failed", error);
            alert('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return <div className="container section">Your cart is empty.</div>;
    }

    return (
        <div className="container section">
            <h1 className="section-title">Checkout</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                {/* Left: Shipping Info */}
                <div>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '10px' }}>Shipping Information</h2>
                    <form id="checkout-form" onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={shippingInfo.name}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={shippingInfo.email}
                                onChange={handleInputChange}
                                placeholder="For order confirmation & tracking"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={shippingInfo.phone}
                                onChange={handleInputChange}
                                placeholder="010-0000-0000"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Address</label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={shippingInfo.address}
                                onChange={handleInputChange}
                                placeholder="Street Address"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                            />
                            <input
                                type="text"
                                name="detailAddress"
                                value={shippingInfo.detailAddress}
                                onChange={handleInputChange}
                                placeholder="Apt, Suite, Unit, etc. (Optional)"
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                                <div>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        placeholder="City"
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div>
                                    <select
                                        name="state"
                                        required
                                        value={shippingInfo.state}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: 'white' }}
                                    >
                                        <option value="">State</option>
                                        {US_STATES.map(st => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        required
                                        value={shippingInfo.zipCode}
                                        onChange={handleZipChange}
                                        placeholder="Zip Code"
                                        maxLength="5"
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Delivery Note</label>
                            <input
                                type="text"
                                name="memo"
                                value={shippingInfo.memo}
                                onChange={handleInputChange}
                                placeholder="Ex: Leave at the front door."
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </form>
                </div>

                {/* Right: Order Summary */}
                <div style={{
                    background: '#f9f9f9',
                    padding: '30px',
                    borderRadius: 'var(--border-radius)',
                    height: 'fit-content'
                }}>
                    <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
                    <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '10px' }}>
                                <span>{item.product.title} x {item.quantity}</span>
                                <span>${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                        {/* Promo Code Input */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Promotion Code</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    placeholder="Enter Code"
                                    style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' }}
                                />
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const result = applyCoupon(promoCode);
                                        alert(result.message);
                                    }}
                                    style={{ padding: '10px 15px', background: '#4A4E53', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Subtotal</span>
                            <span>${totals.subtotal.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#16a34a', fontWeight: '500' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>Shipping</span>
                                <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: '400' }}>Excluding production (14-21 days)</span>
                            </div>
                            <span style={{ fontSize: '0.85rem' }}>FREE (International Air)</span>
                        </div>
                        {totals.volumeDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--accent-color)' }}>
                                <span>Volume Discount</span>
                                <span>-${totals.volumeDiscount.toLocaleString()}</span>
                            </div>
                        )}
                        {totals.couponDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--accent-color)' }}>
                                <span>Coupon ({coupon?.code})</span>
                                <span>-${totals.couponDiscount.toLocaleString()}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span>${totals.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '30px', padding: '15px' }}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
