import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowLeft, CheckCircle, AlertTriangle, Video, Download } from 'lucide-react';

const HowToInstall = () => {
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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <Wrench size={64} style={{ marginBottom: '20px' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 16px 0' }}>
                    How To Install Blinds & Shades
                </h1>
                <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', opacity: 0.95 }}>
                    Easy-to-follow installation guides with step-by-step instructions
                </p>
            </div>

            {/* Content */}
            <div className="container" style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
                {/* Tools Needed */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f' }}>
                        Tools You'll Need
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {[
                            'Power drill or screwdriver',
                            'Measuring tape',
                            'Pencil',
                            'Level',
                            'Ladder or step stool',
                            'Safety glasses'
                        ].map((tool, index) => (
                            <div key={index} style={{ 
                                background: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <CheckCircle size={20} color="#2e7d32" />
                                <span style={{ color: '#333', fontSize: '0.9rem', fontWeight: '500' }}>{tool}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inside Mount Installation */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f' }}>
                        Inside Mount Installation
                    </h2>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        {[
                            {
                                step: 1,
                                title: 'Mark Bracket Positions',
                                description: 'Hold the brackets inside the window frame at the top corners. Mark the screw holes with a pencil. Ensure brackets are level and at equal heights.'
                            },
                            {
                                step: 2,
                                title: 'Pre-drill Holes',
                                description: 'Using a drill bit slightly smaller than your screws, pre-drill holes at the marked positions. This prevents wood from splitting and makes installation easier.'
                            },
                            {
                                step: 3,
                                title: 'Install Brackets',
                                description: 'Secure the brackets to the window frame using the provided screws. Make sure they are tight and firmly attached. Double-check that they are level.'
                            },
                            {
                                step: 4,
                                title: 'Insert Headrail',
                                description: 'Slide the headrail into the brackets. You should hear a click when it locks into place. Gently tug to ensure it\'s secure.'
                            },
                            {
                                step: 5,
                                title: 'Install Valance (Optional)',
                                description: 'If your blinds came with a valance, snap it onto the front of the headrail. This covers the mechanism for a finished look.'
                            },
                            {
                                step: 6,
                                title: 'Test Operation',
                                description: 'Lower and raise the blinds several times to ensure smooth operation. Adjust the tilt mechanism if applicable. Make any necessary adjustments.'
                            }
                        ].map((item, index) => (
                            <div key={index} style={{ 
                                marginBottom: index < 5 ? '30px' : '0',
                                paddingBottom: index < 5 ? '30px' : '0',
                                borderBottom: index < 5 ? '1px solid #e5e5e5' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                                        color: 'white', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        flexShrink: 0
                                    }}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                            {item.title}
                                        </h4>
                                        <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Outside Mount Installation */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f' }}>
                        Outside Mount Installation
                    </h2>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        {[
                            {
                                step: 1,
                                title: 'Mark Bracket Positions',
                                description: 'Position brackets on the wall or window frame where you want the blinds mounted. Use a level to ensure they are straight. Mark screw holes with a pencil.'
                            },
                            {
                                step: 2,
                                title: 'Check for Studs',
                                description: 'Use a stud finder to locate wall studs for the most secure installation. If mounting into drywall without studs, use appropriate wall anchors.'
                            },
                            {
                                step: 3,
                                title: 'Install Wall Anchors (if needed)',
                                description: 'If not mounting into studs, drill holes and insert wall anchors. This provides a secure base for the screws and prevents damage to the wall.'
                            },
                            {
                                step: 4,
                                title: 'Attach Brackets',
                                description: 'Screw the brackets into the wall or window frame. Ensure they are level and firmly secured. The brackets should not wobble or move.'
                            },
                            {
                                step: 5,
                                title: 'Mount Headrail',
                                description: 'Clip or slide the headrail into the mounted brackets. Listen for the click that indicates it\'s locked in place. Test by gently pulling down.'
                            },
                            {
                                step: 6,
                                title: 'Final Adjustments',
                                description: 'Test the blinds by raising and lowering them. Ensure they operate smoothly and hang evenly. Make any necessary adjustments to the brackets.'
                            }
                        ].map((item, index) => (
                            <div key={index} style={{ 
                                marginBottom: index < 5 ? '30px' : '0',
                                paddingBottom: index < 5 ? '30px' : '0',
                                borderBottom: index < 5 ? '1px solid #e5e5e5' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                                        color: 'white', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        flexShrink: 0
                                    }}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                            {item.title}
                                        </h4>
                                        <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Motorized Installation */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f' }}>
                        Motorized Blinds Installation
                    </h2>
                    <div style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', padding: '40px', borderRadius: '16px' }}>
                        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '24px', fontSize: '1rem' }}>
                            Motorized blinds follow the same installation steps as manual blinds, with a few additional considerations:
                        </p>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {[
                                'Ensure batteries are installed before mounting (for battery-powered motors)',
                                'Position the motor end according to your preference (left or right)',
                                'Pair the remote control with the motor before final installation',
                                'For hardwired motors, consult a licensed electrician',
                                'Test the motor operation before completing installation',
                                'Keep the remote control manual for programming instructions'
                            ].map((tip, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <CheckCircle size={20} color="#667eea" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Safety Tips */}
                <div style={{ marginBottom: '60px' }}>
                    <div style={{ background: '#fff3e0', padding: '30px', borderRadius: '16px', borderLeft: '4px solid #ef6c00' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            <AlertTriangle size={32} color="#ef6c00" style={{ flexShrink: 0 }} />
                            <div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px', color: '#e65100' }}>
                                    Safety Tips
                                </h3>
                                <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                                    <li>Always wear safety glasses when drilling</li>
                                    <li>Use a sturdy ladder and have someone assist you</li>
                                    <li>Turn off power when installing hardwired motorized blinds</li>
                                    <li>Keep cords and chains out of reach of children and pets</li>
                                    <li>Check that all screws are tight before releasing the blinds</li>
                                    <li>If unsure about electrical work, hire a professional</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video & Downloads */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <Video size={32} color="white" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>
                            Video Tutorials
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                            Watch step-by-step installation videos for visual guidance
                        </p>
                        <button style={{
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}>
                            Watch Videos
                        </button>
                    </div>

                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <Download size={32} color="white" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>
                            PDF Instructions
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                            Download printable installation guides for offline reference
                        </p>
                        <button style={{
                            padding: '10px 24px',
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}>
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '24px' }}>
                        Still have questions about installation?
                    </p>
                    <Link 
                        to="/help"
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                        to="/help/how-to-measure"
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: 'white',
                            color: '#f093fb',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            border: '2px solid #f093fb'
                        }}
                    >
                        How To Measure
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HowToInstall;
