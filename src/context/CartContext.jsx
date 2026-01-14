import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [coupon, setCoupon] = useState(null);

    // Mock Coupons
    const AVAILABLE_COUPONS = {
        'WELCOME10': { type: 'percent', value: 10, code: 'WELCOME10' }, // 10% off
        'SAVE50': { type: 'amount', value: 50, code: 'SAVE50' }   // $50 off
    };

    const addToCart = (product, options, price, quantity) => {
        setCartItems(prev => [
            ...prev,
            {
                id: Date.now(), // Simple unique ID
                product,
                options,
                price,
                quantity
            }
        ]);
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    const updateCartItemQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const applyCoupon = (code) => {
        if (AVAILABLE_COUPONS[code]) {
            setCoupon(AVAILABLE_COUPONS[code]);
            return { success: true, message: '쿠폰이 적용되었습니다.' };
        }
        return { success: false, message: '유효하지 않은 쿠폰 코드입니다.' };
    };

    const calculateTotals = () => {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Volume Discount Logic (Value-Based benchmarked from Allesin)
        let volumeDiscountRate = 0;
        if (subtotal >= 1000) volumeDiscountRate = 0.25;
        else if (subtotal >= 600) volumeDiscountRate = 0.20;
        else if (subtotal >= 300) volumeDiscountRate = 0.10;

        const volumeDiscount = Math.floor(subtotal * volumeDiscountRate);

        // Coupon Discount Logic
        let couponDiscount = 0;
        if (coupon) {
            if (coupon.type === 'percent') {
                couponDiscount = Math.floor((subtotal - volumeDiscount) * (coupon.value / 100));
            } else if (coupon.type === 'amount') {
                couponDiscount = coupon.value;
            }
        }

        const discountedSubtotal = Math.max(0, subtotal - volumeDiscount - couponDiscount);

        // Texas Tax (8.25%)
        const taxRate = 0.0825;
        const tax = Math.floor(discountedSubtotal * taxRate);

        const total = discountedSubtotal + tax;

        return {
            subtotal,
            volumeDiscount,
            couponDiscount,
            tax,
            total,
            volumeDiscountRate
        };
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        applyCoupon,
        coupon,
        calculateTotals
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
