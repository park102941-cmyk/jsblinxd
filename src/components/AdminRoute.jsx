import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const AdminRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (passwordInput === '123456') {
            setIsAdmin(true);
            setError('');
        } else {
            setError('Incorrect Password');
        }
    };

    if (!isAdmin) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f7'
            }}>
                <form onSubmit={handleLogin} style={{
                    padding: '2rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#1d1d1f' }}>Admin Access</h2>
                    <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter Admin Password"
                        style={{
                            width: '90%',
                            padding: '12px',
                            marginBottom: '1rem',
                            border: '1px solid #d2d2d7',
                            borderRadius: '8px',
                            fontSize: '1rem'
                        }}
                    />
                    {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                    <button type="submit" style={{
                        width: '100%',
                        padding: '12px',
                        background: '#0071e3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                    }}>
                        Enter Dashboard
                    </button>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#86868b' }}>
                        Protected Area
                    </div>
                </form>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
