
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
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.05rem' }}>{item.product.title}</h3>
                                <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <p style={{ margin: 0 }}>
                                        <strong>Size:</strong> {item.product.width}" W x {item.product.height}" H
                                    </p>
                                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <strong>Color:</strong> {item.product.selectedColor} 
                                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.options?.color?.hex || '#eee', border: '1px solid #ddd' }}></span>
                                    </p>
                                    {item.product.room && (
                                        <p style={{ margin: 0 }}><strong>Room:</strong> {item.product.room}</p>
                                    )}
                                    {item.product.mount && (
                                        <p style={{ margin: 0 }}><strong>Mount:</strong> {item.product.mount === 'inside' ? 'Inside' : 'Outside'}</p>
                                    )}
                                    {item.product.customConfigs && Object.entries(item.product.customConfigs).length > 0 && (
                                        <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #eee' }}>
                                            {Object.entries(item.product.customConfigs).map(([key, value]) => (
                                                <p key={key} style={{ margin: 0, fontSize: '0.75rem' }}>• {key}: {value}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
                                        if (window.confirm('Would you like to edit the options for this item? It will be removed from your cart while you make changes.')) {
                                            removeFromCart(item.id);
                                            navigate(`/product/${item.product.id}`, { state: { editSelection: item.options } });
                                        }
                                    }} style={{ fontSize: '0.8rem', fontWeight: '600', textDecoration: 'underline', color: '#0369a1', background: 'none', border: 'none', cursor: 'pointer' }}>
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
