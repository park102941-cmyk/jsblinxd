import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import './Footer.css';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ loading: false, message: '', type: '' });

    const handleSubscribe = async () => {
        if (!email || !email.includes('@')) {
            setStatus({ loading: false, message: 'Please enter a valid email.', type: 'error' });
            return;
        }

        setStatus({ loading: true, message: '', type: '' });

        try {
            await addDoc(collection(db, "newsletter_subscribers"), {
                email: email,
                subscribedAt: new Date(),
                source: 'footer'
            });
            setStatus({ loading: false, message: 'Thanks for subscribing!', type: 'success' });
            setEmail('');
        } catch (error) {
            console.error("Subscription error:", error);
            setStatus({ loading: false, message: 'Something went wrong. Please try again.', type: 'error' });
        }
    };

    return (
        <footer className="footer">
            <div className="container">
                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="JSBlind Logo" style={{ height: '55px', objectFit: 'contain', backgroundColor: 'white', padding: '2px', borderRadius: '4px' }} />
                    <span style={{ 
                        fontSize: '1.8rem', 
                        fontWeight: '800', 
                        color: 'var(--secondary-olive)', 
                        letterSpacing: '-1.5px',
                        textTransform: 'uppercase'
                    }}>JSBlind</span>
                </div>
                <div className="footer-container">
                    {/* Newsletter & Info Section */}
                    <div className="footer-section">
                        <h3>Stay Connected</h3>
                        <p className="footer-text">
                            Subscribe to receive updates, access to exclusive deals, and more.
                        </p>
                        <div className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="newsletter-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                                disabled={status.loading}
                            />
                            <button
                                className="newsletter-submit"
                                onClick={handleSubscribe}
                                disabled={status.loading}
                            >
                                Submit
                            </button>
                        </div>
                        {status.message && (
                            <p style={{
                                marginTop: '10px',
                                fontSize: '0.8rem',
                                color: status.type === 'error' ? '#ff3b30' : '#4cd964'
                            }}>
                                {status.message}
                            </p>
                        )}
                        <div className="social-icons" style={{ marginTop: '30px' }}>
                            <a href="#" className="social-icon"><Facebook size={18} /></a>
                            <a href="#" className="social-icon"><Instagram size={18} /></a>
                            <a href="#" className="social-icon"><Youtube size={18} /></a>
                            <a href="#" className="social-icon"><Twitter size={18} /></a>
                        </div>
                    </div>

                    {/* Shop Section */}
                    <div className="footer-section">
                        <h3>Our Collections</h3>
                        <ul className="footer-links">
                            <li><Link to="/products?category=roller">Roller Shades</Link></li>
                            <li><Link to="/products?category=zebra">Zebra Shades</Link></li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div className="footer-section">
                        <h3>Customer Care</h3>
                        <ul className="footer-links">
                            <li><Link to="/help">Help Center</Link></li>
                            <li><Link to="/track-order">Track Your Order</Link></li>
                            <li><Link to="/support">Shipping & Delivery</Link></li>
                            <li><Link to="/support#returns">Returns & Refunds</Link></li>
                            <li><Link to="/swatches">Fabric Samples</Link></li>
                            <li><Link to="/about-us">Our Story</Link></li>
                            <li><a href="/admin" style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>Admin Portal (Legacy)</a></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="footer-section">
                        <h3>Texas Headquarters</h3>
                        <ul className="footer-links">
                            <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem' }}>
                                <MapPin size={16} /> <span>5699 State Highway 121, The Colony, TX 75056</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem' }}>
                                <Phone size={16} /> <span>214-649-9992</span>
                            </li>
                            <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', lineHeight: '1.4', marginTop: '5px' }}>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Official Partner of JSBlind™ Factory Direct</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <div className="footer-copyright" style={{ fontSize: '0.75rem', color: '#888', fontWeight: '600' }}>
                        © 2026 JSBlind. THE SMART CHOICE FOR WINDOWS.
                    </div>

                    <div className="payment-methods">
                        <div className="payment-icon">VISA</div>
                        <div className="payment-icon">AMEX</div>
                        <div className="payment-icon">P.PAL</div>
                        <div className="payment-icon">APPLE</div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
