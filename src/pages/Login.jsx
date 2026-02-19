import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { auth, db, googleProvider, facebookProvider } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');

    // OTP states
    const [otpStep, setOtpStep] = useState(false); // false = form, true = OTP input
    const [otpCode, setOtpCode] = useState('');
    const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const navigate = useNavigate();

    // Save user to Firestore if new
    const saveUserToFirestore = async (user, provider = 'email') => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || name || '',
                photoURL: user.photoURL || '',
                provider,
                createdAt: new Date().toISOString(),
                isAdmin: false
            });
        }
    };

    // Send OTP via Google Apps Script
    const sendOTP = async (targetEmail, code) => {
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'sendOTP',
                    email: targetEmail,
                    code: code,
                    name: name || targetEmail
                })
            });
        } catch (err) {
            console.error('OTP email send error:', err);
        }
    };

    // Start countdown timer
    const startCountdown = (seconds = 180) => {
        setCountdown(seconds);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const formatCountdown = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

    // Handle OTP digit input
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newInputs = [...otpInputs];
        newInputs[index] = value.slice(-1);
        setOtpInputs(newInputs);
        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // STEP 1: Validate form and send OTP
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) { setError('Please enter your name.'); return; }
        if (!email.trim()) { setError('Please enter your email.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

        setOtpLoading(true);
        try {
            const code = generateOTP();
            // Store OTP in Firestore with 10-min expiry
            await setDoc(doc(db, 'emailOTPs', email), {
                code,
                name,
                email,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            });

            // Send via Google Script
            await sendOTP(email, code);

            setOtpStep(true);
            setCodeSent(true);
            setOtpInputs(['', '', '', '', '', '']);
            startCountdown(180);
            setTimeout(() => document.getElementById('otp-0')?.focus(), 300);
        } catch (err) {
            setError('Failed to send verification code. Please try again.');
            console.error(err);
        } finally {
            setOtpLoading(false);
        }
    };

    // STEP 2: Verify OTP and create account
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const enteredCode = otpInputs.join('');
        if (enteredCode.length !== 6) { setError('Please enter all 6 digits.'); return; }

        setLoading(true);
        setError('');
        try {
            // Check OTP in Firestore
            const otpDoc = await getDoc(doc(db, 'emailOTPs', email));
            if (!otpDoc.exists()) {
                setError('Verification code expired. Please request a new one.');
                setLoading(false);
                return;
            }
            const otpData = otpDoc.data();

            // Check expiry
            if (new Date() > new Date(otpData.expiresAt)) {
                setError('Verification code expired. Please request a new one.');
                setLoading(false);
                return;
            }

            // Check code
            if (enteredCode !== otpData.code) {
                setError('Incorrect code. Please try again.');
                setLoading(false);
                return;
            }

            // OTP correct - create account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await saveUserToFirestore(userCredential.user);

            // Delete OTP from Firestore
            await deleteDoc(doc(db, 'emailOTPs', email));

            navigate('/account');
        } catch (err) {
            const messages = {
                'auth/email-already-in-use': 'This email is already registered.',
                'auth/weak-password': 'Password must be at least 6 characters.',
                'auth/invalid-email': 'Invalid email address.',
            };
            setError(messages[err.code] || `Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Regular email login (no OTP needed)
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/account');
        } catch (err) {
            const messages = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/invalid-email': 'Invalid email address.',
            };
            setError(messages[err.code] || `Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Google login
    const handleGoogleLogin = async () => {
        setSocialLoading('google');
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await saveUserToFirestore(result.user, 'google');
            navigate('/account');
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Google login failed. Please try again.');
            }
        } finally {
            setSocialLoading('');
        }
    };

    // Facebook login
    const handleFacebookLogin = async () => {
        setSocialLoading('facebook');
        setError('');
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            await saveUserToFirestore(result.user, 'facebook');
            navigate('/account');
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Facebook login failed. Please try again.');
            }
        } finally {
            setSocialLoading('');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '2px solid #e5e5e5',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    };
    const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500', color: '#1d1d1f' };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                padding: '48px 40px',
                width: '100%',
                maxWidth: '440px'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <img src="/logo.png" alt="JSBlind" style={{ height: '48px', marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1d1d1f', margin: 0 }}>
                        {isLogin ? 'Welcome back' : (otpStep ? 'Verify your email' : 'Create account')}
                    </h1>
                    <p style={{ color: '#6e6e73', marginTop: '8px', fontSize: '0.95rem' }}>
                        {isLogin
                            ? 'Sign in to your JSBlind account'
                            : otpStep
                                ? `We sent a 6-digit code to ${email}`
                                : 'Join JSBlind today'}
                    </p>
                </div>

                {/* OTP Step - 6 digit input */}
                {!isLogin && otpStep ? (
                    <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* 6 digit boxes */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            {otpInputs.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    onPaste={i === 0 ? (e) => {
                                        const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
                                        if (pasted.length === 6) {
                                            setOtpInputs(pasted.split(''));
                                            document.getElementById('otp-5')?.focus();
                                            e.preventDefault();
                                        }
                                    } : undefined}
                                    style={{
                                        width: '50px',
                                        height: '60px',
                                        textAlign: 'center',
                                        fontSize: '1.6rem',
                                        fontWeight: '700',
                                        borderRadius: '12px',
                                        border: digit ? '2px solid #0071e3' : '2px solid #e5e5e5',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        color: '#1d1d1f',
                                        background: digit ? '#f0f7ff' : 'white'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#0071e3'}
                                    onBlur={e => { if (!e.target.value) e.target.style.borderColor = '#e5e5e5'; }}
                                />
                            ))}
                        </div>

                        {/* Countdown */}
                        {countdown > 0 && (
                            <p style={{ textAlign: 'center', color: '#6e6e73', fontSize: '0.875rem', margin: 0 }}>
                                Code expires in <strong style={{ color: countdown < 60 ? '#d32f2f' : '#1d1d1f' }}>{formatCountdown(countdown)}</strong>
                            </p>
                        )}

                        {error && (
                            <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fff0f0', border: '1px solid #ffcdd2', color: '#d32f2f', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || otpInputs.join('').length < 6}
                            style={{
                                padding: '13px',
                                borderRadius: '12px',
                                border: 'none',
                                background: otpInputs.join('').length < 6 ? '#ccc' : 'linear-gradient(135deg, #0071e3 0%, #0056b0 100%)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading || otpInputs.join('').length < 6 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify & Create Account'}
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button type="button" onClick={() => { setOtpStep(false); setError(''); }}
                                style={{ background: 'none', border: 'none', color: '#6e6e73', cursor: 'pointer', fontSize: '0.875rem' }}>
                                ← Go back
                            </button>
                            <button type="button"
                                disabled={countdown > 0 || otpLoading}
                                onClick={async () => {
                                    setOtpLoading(true);
                                    const code = generateOTP();
                                    await setDoc(doc(db, 'emailOTPs', email), { code, name, email, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() });
                                    await sendOTP(email, code);
                                    startCountdown(180);
                                    setOtpInputs(['', '', '', '', '', '']);
                                    setOtpLoading(false);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: countdown > 0 ? '#ccc' : '#0071e3',
                                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                {otpLoading ? 'Sending...' : 'Resend code'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Social Login — only on login mode */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            {/* Google */}
                            <button onClick={handleGoogleLogin} disabled={!!socialLoading || loading}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '13px 20px', borderRadius: '12px', border: '2px solid #e5e5e5', background: 'white', cursor: socialLoading || loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontWeight: '600', color: '#1d1d1f', transition: 'all 0.2s', opacity: socialLoading === 'facebook' ? 0.6 : 1 }}
                                onMouseOver={e => { if (!socialLoading && !loading) e.currentTarget.style.borderColor = '#4285f4'; }}
                                onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e5e5'; }}>
                                {socialLoading === 'google' ? (
                                    <span style={{ width: '20px', height: '20px', border: '2px solid #ddd', borderTopColor: '#4285f4', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                )}
                                {socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
                            </button>

                            {/* Facebook */}
                            <button onClick={handleFacebookLogin} disabled={!!socialLoading || loading}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '13px 20px', borderRadius: '12px', border: '2px solid #1877f2', background: '#1877f2', cursor: socialLoading || loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontWeight: '600', color: 'white', transition: 'all 0.2s', opacity: socialLoading === 'google' ? 0.6 : 1 }}
                                onMouseOver={e => { if (!socialLoading && !loading) e.currentTarget.style.background = '#1565d8'; }}
                                onMouseOut={e => { if (socialLoading !== 'facebook') e.currentTarget.style.background = '#1877f2'; }}>
                                {socialLoading === 'facebook' ? (
                                    <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                )}
                                {socialLoading === 'facebook' ? 'Connecting...' : 'Continue with Facebook'}
                            </button>
                        </div>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }} />
                            <span style={{ color: '#6e6e73', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>or continue with email</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }} />
                        </div>

                        {/* Email Form */}
                        <form onSubmit={isLogin ? handleLogin : handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {!isLogin && (
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                                        style={inputStyle} onFocus={e => e.target.style.borderColor='#0071e3'} onBlur={e => e.target.style.borderColor='#e5e5e5'} />
                                </div>
                            )}
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                                    style={inputStyle} onFocus={e => e.target.style.borderColor='#0071e3'} onBlur={e => e.target.style.borderColor='#e5e5e5'} />
                            </div>
                            <div>
                                <label style={labelStyle}>Password</label>
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                    style={inputStyle} onFocus={e => e.target.style.borderColor='#0071e3'} onBlur={e => e.target.style.borderColor='#e5e5e5'} />
                            </div>
                            {!isLogin && (
                                <div>
                                    <label style={labelStyle}>Confirm Password</label>
                                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                                        style={inputStyle} onFocus={e => e.target.style.borderColor='#0071e3'} onBlur={e => e.target.style.borderColor='#e5e5e5'} />
                                </div>
                            )}

                            {error && (
                                <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fff0f0', border: '1px solid #ffcdd2', color: '#d32f2f', fontSize: '0.875rem' }}>
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading || !!socialLoading || otpLoading}
                                style={{ padding: '13px', borderRadius: '12px', border: 'none', background: (loading || otpLoading) ? '#999' : 'linear-gradient(135deg, #0071e3 0%, #0056b0 100%)', color: 'white', fontSize: '1rem', fontWeight: '600', cursor: loading || socialLoading || otpLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: '4px' }}
                                onMouseOver={e => { if (!loading && !socialLoading && !otpLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                                {otpLoading ? 'Sending code...' : loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Send Verification Code →'}
                            </button>
                        </form>

                        {/* Toggle */}
                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <span style={{ color: '#6e6e73', fontSize: '0.9rem' }}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                            </span>
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); setOtpStep(false); }}
                                style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Login;
