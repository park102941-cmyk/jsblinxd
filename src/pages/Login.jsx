import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth, db } from '../lib/firebase'; // Ensure db is exported from firebase.js if we save user data
import { doc, setDoc } from 'firebase/firestore';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState(''); // For signup
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match.');
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update profile with name
                await updateProfile(user, { displayName: name });

                // Create user document in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: name,
                    createdAt: new Date().toISOString(),
                    isAdmin: false // Default to false
                });
            }
            navigate('/account'); // Redirect to My Account after login
        } catch (err) {
            console.error(err);
            // Show specific error for debugging
            setError(`Login/Signup failed: ${err.message} (${err.code})`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section" style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h1 className="section-title">{isLogin ? 'Login' : 'Sign Up'}</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!isLogin && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                {!isLogin && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                )}

                {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ padding: '12px', marginTop: '10px' }}
                >
                    {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ background: 'none', border: 'none', color: 'var(--secondary-color)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
};

export default Login;
