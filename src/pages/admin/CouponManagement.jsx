import React, { useState } from 'react';

const CouponManagement = () => {
    // Mock data for now, ideally fetch from Firestore collection 'coupons'
    const [coupons, setCoupons] = useState([
        { id: 1, name: 'Welcome Bonus', code: 'WELCOME10', type: 'percent', value: 10, expiry: '2025-12-31' },
        { id: 2, name: 'Winter Sale', code: 'WINTER2024', type: 'amount', value: 5, expiry: '2024-02-28' },
    ]);

    const [newCoupon, setNewCoupon] = useState({ name: '', code: '', type: 'percent', value: 0, expiry: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        setCoupons([...coupons, { ...newCoupon, id: Date.now() }]);
        setNewCoupon({ name: '', code: '', type: 'percent', value: 0, expiry: '' });
        // Save to Firestore here
    };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
                <div>
                    <h2>Coupon List</h2>
                    <div style={{ marginTop: '20px', display: 'grid', gap: '15px' }}>
                        {coupons.map(coupon => (
                            <div key={coupon.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{coupon.name} <span style={{ color: 'var(--accent-color)', marginLeft: '10px' }}>{coupon.code}</span></h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                                        {coupon.type === 'percent' ? `${coupon.value}% OFF` : `$${coupon.value} OFF`} | Expires: {coupon.expiry}
                                    </p>
                                </div>
                                <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Create Coupon</h3>
                    <form onSubmit={handleAdd} style={{ display: 'grid', gap: '10px' }}>
                        <input
                            type="text" placeholder="Coupon Name" required
                            value={newCoupon.name} onChange={e => setNewCoupon({ ...newCoupon, name: e.target.value })}
                            style={{ padding: '8px', width: '100%' }}
                        />
                        <input
                            type="text" placeholder="Code (Alphanumeric)" required
                            value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                            style={{ padding: '8px', width: '100%' }}
                        />
                        <select
                            value={newCoupon.type} onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                            style={{ padding: '8px', width: '100%' }}
                        >
                            <option value="percent">% Discount</option>
                            <option value="amount">Amount Discount</option>
                        </select>
                        <input
                            type="number" placeholder="Value" required
                            value={newCoupon.value} onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value })}
                            style={{ padding: '8px', width: '100%' }}
                        />
                        <input
                            type="date" required
                            value={newCoupon.expiry} onChange={e => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                            style={{ padding: '8px', width: '100%' }}
                        />
                        <button className="btn btn-primary" type="submit">Create</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CouponManagement;
