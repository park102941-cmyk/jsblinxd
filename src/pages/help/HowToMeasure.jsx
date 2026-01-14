import React from 'react';
import { Link } from 'react-router-dom';
import { Ruler, ArrowLeft, CheckCircle } from 'lucide-react';

const HowToMeasure = () => {
    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            {/* Breadcrumb */}
            <div className="container" style={{ padding: '20px' }}>
                <Link to="/help" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary-green)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to Help Center
                </Link>
            </div>

            {/* Hero */}
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <Ruler size={64} style={{ marginBottom: '20px' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 16px 0' }}>
                    How To Measure for Blinds & Shades
                </h1>
                <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', opacity: 0.95 }}>
                    Follow these simple steps to ensure a perfect fit for your window treatments
                </p>
            </div>

            {/* Content */}
            <div className="container" style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
                {/* Inside vs Outside Mount */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f' }}>
                        Choose Your Mount Type
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '16px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '16px', color: '#1d1d1f' }}>
                                Inside Mount
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
                                Blinds fit inside the window frame for a clean, built-in look. Recommended when you have sufficient depth (at least 2 inches).
                            </p>
                            <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
                                <li>Clean, streamlined appearance</li>
                                <li>Showcases window trim</li>
                                <li>Requires adequate depth</li>
                            </ul>
                        </div>

                        <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '16px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '16px', color: '#1d1d1f' }}>
                                Outside Mount
                            </h3>
                            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
                                Blinds mount on the wall or window frame, covering the entire window. Best for maximum light control and privacy.
                            </p>
                            <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
                                <li>Maximum light blockage</li>
                                <li>Makes windows appear larger</li>
                                <li>Works with any window depth</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Inside Mount Instructions */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f' }}>
                        Inside Mount Measuring
                    </h2>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#667eea', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    1
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                        Measure Width
                                    </h4>
                                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                        Measure the inside width of the window frame at the top, middle, and bottom. Use the <strong>narrowest</strong> measurement. Round down to the nearest 1/8 inch.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#667eea', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    2
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                        Measure Height
                                    </h4>
                                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                        Measure the inside height of the window frame on the left, center, and right. Use the <strong>longest</strong> measurement. Round down to the nearest 1/8 inch.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#667eea', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    3
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                        Check Depth
                                    </h4>
                                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                        Measure the depth of the window frame from the front to the back. You need at least 2 inches for most blinds, 3 inches for cellular shades.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #ef6c00' }}>
                            <p style={{ color: '#e65100', fontWeight: '600', margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                                ⚠️ Important Note
                            </p>
                            <p style={{ color: '#666', margin: '0 0 10px 0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                We will deduct 1/4" from your width measurement to ensure proper fit and operation. Do not make any deductions yourself.
                            </p>
                            <p style={{ color: '#e65100', fontWeight: '600', margin: '15px 0 8px 0', fontSize: '0.95rem' }}>
                                🛠️ Installation Note
                            </p>
                            <p style={{ color: '#666', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Variations in the side gaps between the top and bottom are usually due to uneven window frames, not a product defect. Please check your window’s alignment before installation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Outside Mount Instructions */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f' }}>
                        Outside Mount Measuring
                    </h2>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#f093fb', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    1
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                        Measure Width
                                    </h4>
                                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                        Measure the exact width you want the blind to cover. We recommend adding 2-3 inches on each side of the window frame for maximum light control.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#f093fb', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    2
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                        Measure Height
                                    </h4>
                                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                        Measure from where you want the top of the blind to be to where you want the bottom. Add 2-3 inches above the window frame for best coverage.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#f093fb', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    3
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                        Check Mounting Surface
                                    </h4>
                                    <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                        Ensure you have a flat, solid surface for mounting. The surface should be at least 1.5 inches wide for proper bracket installation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #1565c0' }}>
                            <p style={{ color: '#0d47a1', fontWeight: '600', margin: '0 0 8px 0', fontSize: '0.95rem' }}>
                                💡 Pro Tip
                            </p>
                            <p style={{ color: '#666', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                                For outside mount, we will make the blind to your exact specifications. Make sure to account for any overlap you want for light control.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', padding: '40px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', color: '#1d1d1f' }}>
                        Measuring Tips
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {[
                            'Always use a steel measuring tape for accuracy',
                            'Measure to the nearest 1/8 inch',
                            'Take multiple measurements and use the most accurate one',
                            'Check for obstructions like handles, locks, or cranks',
                            'Measure each window separately - they may vary',
                            'Write down all measurements immediately'
                        ].map((tip, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <CheckCircle size={20} color="#2e7d32" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '24px' }}>
                        Need help with measuring? Our team is here to assist!
                    </p>
                    <Link 
                        to="/help"
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            marginRight: '16px'
                        }}
                    >
                        Contact Support
                    </Link>
                    <Link 
                        to="/products"
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: 'white',
                            color: '#667eea',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            border: '2px solid #667eea'
                        }}
                    >
                        Shop Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HowToMeasure;
