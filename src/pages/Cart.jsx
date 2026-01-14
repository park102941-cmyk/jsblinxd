
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, updateCartItemQuantity, applyCoupon, calculateTotals, coupon } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const totals = calculateTotals();

    const handleApplyCoupon = () => {
        const result = applyCoupon(couponCode);
        if (result.success) {
            setMessage('Coupon applied!');
        } else {
            setMessage(result.message);
        }
    };

    if (cartItems.length === 0) {
        return <div className="container section">Your cart is empty.</div>;
    }

    return (
        <div className="container section">
            <h1 className="section-title">Shopping Cart</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
                {/* Cart Items */}
                <div>
                    {cartItems.map((item) => (
                        <div key={item.id} style={{
                            display: 'flex',
                            gap: '20px',
                            marginBottom: '20px',
                            paddingBottom: '20px',
                            borderBottom: '1px solid #eee'
                        }}>
                            <img src={item.product.imageUrl || 'https://via.placeholder.com/100'} alt={item.product.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 5px 0' }}>{item.product.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                                    {item.width}cm x {item.height}cm | Color: <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: item.color, border: '1px solid #ccc' }}></span>
                                </p>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Qty: {item.quantity}</p>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${(item.price * item.quantity).toLocaleString()}</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <button onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ width: '25px', height: '25px', borderRadius: '50%', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>-</button>
                                    <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)} style={{ width: '25px', height: '25px', borderRadius: '50%', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>+</button>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {/* Edit Options (Simulated by navigating back - sophisticated logic would require pre-filling state) */}
                                    <button onClick={() => {
                                        if (window.confirm('To edit options, we need to remove this item and go back to the product page. Proceed?')) {
                                            removeFromCart(item.id);
                                            navigate(`/product/${item.product.id || 1}`, { state: { editSelection: item.options } });
                                        }
                                    }} style={{ fontSize: '0.8rem', textDecoration: 'underline', color: 'var(--accent-color)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        Edit
                                    </button>
                                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div style={{
                    background: '#f9f9f9',
                    padding: '20px',
                    borderRadius: 'var(--border-radius)',
                    height: 'fit-content'
                }}>
                    <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>

                    {/* Coupon Input */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Coupon Code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <button onClick={handleApplyCoupon} className="btn btn-secondary" style={{ padding: '8px 12px' }}>Apply</button>
                    </div>
                    {message && <p style={{ fontSize: '0.8rem', color: message.includes('applied') ? 'green' : 'red', marginBottom: '15px' }}>{message}</p>}

                    <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Subtotal</span>
                            <span>${totals.subtotal.toLocaleString()}</span>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Tax (8.25%)</span>
                            <span>${totals.tax.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span>${totals.total.toLocaleString()}</span>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '30px', padding: '15px' }}
                            onClick={() => navigate('/checkout')}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
