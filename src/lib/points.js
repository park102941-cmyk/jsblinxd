// Points System Utility
// Earn: $1 = 0.1 points
// Redeem: 1 point = $0.50 discount

import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

export const POINTS_PER_DOLLAR = 0.1;      // earn 0.1 point per $1 spent
export const DISCOUNT_PER_POINT = 0.50;    // 1 point = $0.50 off

// Calculate points earned from an order total
export const calcPointsEarned = (orderTotal) => {
    return Math.floor(orderTotal * POINTS_PER_DOLLAR * 10) / 10;
};

// Calculate discount from points used
export const calcPointsDiscount = (pointsToUse) => {
    return pointsToUse * DISCOUNT_PER_POINT;
};

// Add points to user after a successful order
export const awardPoints = async (userId, orderTotal, orderId) => {
    if (!userId || userId === 'guest') return;
    const earned = calcPointsEarned(orderTotal);
    if (earned <= 0) return;
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            points: increment(earned),
            pointsHistory: arrayUnion({
                type: 'earned',
                points: earned,
                orderId,
                description: `Earned from order #${orderId}`,
                date: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error('Failed to award points:', e);
    }
};

// Deduct points when redeemed at checkout
export const redeemPoints = async (userId, pointsUsed, orderId) => {
    if (!userId || userId === 'guest' || pointsUsed <= 0) return;
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            points: increment(-pointsUsed),
            pointsHistory: arrayUnion({
                type: 'redeemed',
                points: -pointsUsed,
                orderId,
                description: `Redeemed for order #${orderId}`,
                discount: calcPointsDiscount(pointsUsed),
                date: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error('Failed to redeem points:', e);
    }
};

// Get user's current points balance
export const getUserPoints = async (userId) => {
    if (!userId || userId === 'guest') return 0;
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? (userDoc.data().points || 0) : 0;
    } catch (e) {
        return 0;
    }
};
