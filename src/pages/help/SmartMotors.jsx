import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowLeft, Zap, Battery, Wifi, Smartphone, Clock, Shield, CheckCircle, Home as HomeIcon } from 'lucide-react';

const SmartMotors = () => {
    const motorTypes = [
        {
            icon: Battery,
            name: 'Battery Powered',
            description: 'Wireless convenience with rechargeable batteries',
            pros: ['No wiring required', 'Easy installation', 'Portable and flexible', 'Rechargeable batteries'],
            cons: ['Requires periodic charging', 'Battery replacement eventually needed'],
            bestFor: 'Renters, easy retrofits, windows without power access',
            color: '#667eea'
        },
        {
            icon: Zap,
            name: 'Hardwired (AC)',
            description: 'Direct power connection for permanent installation',
            pros: ['Never needs charging', 'Most reliable', 'Strongest motors', 'Best for large windows'],
            cons: ['Requires electrical work', 'Professional installation recommended'],
            bestFor: 'New construction, permanent installations, large/heavy blinds',
            color: '#f093fb'
        },
        {
            icon: Wifi,
            name: 'Smart Hub Compatible',
            description: 'Connects to your smart home ecosystem',
            pros: ['Voice control', 'Automation schedules', 'Remote access', 'Scene integration'],
            cons: ['Requires hub/bridge', 'Setup complexity', 'Internet dependent'],
            bestFor: 'Smart home enthusiasts, automation lovers',
            color: '#4facfe'
        }
    ];

    const smartPlatforms = [
        {
            name: 'Amazon Alexa',
            icon: '🗣️',
            features: ['Voice commands', 'Routines', 'Groups', 'Schedules'],
            example: '"Alexa, close the bedroom blinds"'
        },
        {
            name: 'Google Home',
            icon: '🏠',
            features: ['Voice control', 'Automation', 'Room assignment', 'Sunrise/sunset'],
            example: '"Hey Google, open all blinds to 50%"'
        },
        {
            name: 'Apple HomeKit',
            icon: '🍎',
            features: ['Siri control', 'Scenes', 'Automation', 'Secure'],
            example: '"Hey Siri, set blinds to morning scene"'
        },
        {
            name: 'SmartThings',
            icon: '⚡',
            features: ['Advanced automation', 'Sensors', 'Complex routines', 'Integration'],
            example: 'Automatic based on temperature/light'
        }
    ];

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
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <Cpu size={64} style={{ marginBottom: '20px' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 16px 0' }}>
                    How To Choose Smart Motors
                </h1>
                <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', opacity: 0.95 }}>
                    Transform your blinds with smart motorization and home automation
                </p>
            </div>

            {/* Content */}
            <div className="container" style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
                {/* Motor Types */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px', color: '#1d1d1f', textAlign: 'center' }}>
                        Types of Smart Motors
                    </h2>
                    <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px auto' }}>
                        Choose the right motor type based on your installation needs and preferences
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                        {motorTypes.map((motor, index) => {
                            const Icon = motor.icon;
                            return (
                                <div key={index} style={{
                                    background: 'white',
                                    padding: '35px',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid transparent'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                                    e.currentTarget.style.borderColor = motor.color;
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                                >
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        background: `linear-gradient(135deg, ${motor.color} 0%, ${motor.color}dd 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <Icon size={28} color="white" />
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>
                                        {motor.name}
                                    </h3>
                                    <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                        {motor.description}
                                    </p>
                                    
                                    <div style={{ marginBottom: '16px' }}>
                                        <h4 style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Pros
                                        </h4>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '0.85rem', lineHeight: '1.8' }}>
                                            {motor.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                        </ul>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <h4 style={{ fontSize: '0.85rem', color: '#d32f2f', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Cons
                                        </h4>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '0.85rem', lineHeight: '1.8' }}>
                                            {motor.cons.map((con, i) => <li key={i}>{con}</li>)}
                                        </ul>
                                    </div>

                                    <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                            Best For
                                        </span>
                                        <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: '500' }}>
                                            {motor.bestFor}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Smart Home Compatibility */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '40px', color: '#1d1d1f', textAlign: 'center' }}>
                        Smart Home Compatibility
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                        {smartPlatforms.map((platform, index) => (
                            <div key={index} style={{
                                background: 'white',
                                padding: '30px',
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', textAlign: 'center' }}>
                                    {platform.icon}
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px', color: '#1d1d1f', textAlign: 'center' }}>
                                    {platform.name}
                                </h3>
                                <div style={{ marginBottom: '16px' }}>
                                    {platform.features.map((feature, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <CheckCircle size={16} color="#2e7d32" />
                                            <span style={{ fontSize: '0.85rem', color: '#666' }}>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                        Example Command
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: '#667eea', fontStyle: 'italic' }}>
                                        {platform.example}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features & Benefits */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '40px', color: '#1d1d1f', textAlign: 'center' }}>
                        Smart Motor Features
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                        {[
                            {
                                icon: Clock,
                                title: 'Scheduling',
                                description: 'Set blinds to open/close automatically at specific times'
                            },
                            {
                                icon: Smartphone,
                                title: 'Remote Control',
                                description: 'Control from anywhere using your smartphone app'
                            },
                            {
                                icon: HomeIcon,
                                title: 'Scenes & Routines',
                                description: 'Create custom scenes like "Good Morning" or "Movie Time"'
                            },
                            {
                                icon: Shield,
                                title: 'Security Mode',
                                description: 'Simulate presence when away from home'
                            },
                            {
                                icon: Zap,
                                title: 'Energy Savings',
                                description: 'Optimize natural light and reduce heating/cooling costs'
                            },
                            {
                                icon: Wifi,
                                title: 'Group Control',
                                description: 'Control multiple blinds simultaneously'
                            }
                        ].map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} style={{
                                    background: 'white',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px auto'
                                    }}>
                                        <Icon size={24} color="white" />
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                        {feature.title}
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.6', margin: 0 }}>
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Setup Guide */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f', textAlign: 'center' }}>
                        Quick Setup Guide
                    </h2>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '800px', margin: '0 auto' }}>
                        {[
                            {
                                step: 1,
                                title: 'Install the Motor',
                                description: 'Follow the installation instructions for your specific motor type (battery or hardwired)'
                            },
                            {
                                step: 2,
                                title: 'Download the App',
                                description: 'Install the manufacturer\'s app on your smartphone (iOS or Android)'
                            },
                            {
                                step: 3,
                                title: 'Pair the Motor',
                                description: 'Use the app to discover and pair your motor via Bluetooth or Wi-Fi'
                            },
                            {
                                step: 4,
                                title: 'Set Limits',
                                description: 'Program the upper and lower limits for your blinds to ensure proper operation'
                            },
                            {
                                step: 5,
                                title: 'Connect to Smart Home',
                                description: 'Link the motor to your preferred smart home platform (Alexa, Google, etc.)'
                            },
                            {
                                step: 6,
                                title: 'Create Automations',
                                description: 'Set up schedules, scenes, and routines for automated control'
                            }
                        ].map((item, index) => (
                            <div key={index} style={{ 
                                marginBottom: index < 5 ? '24px' : '0',
                                paddingBottom: index < 5 ? '24px' : '0',
                                borderBottom: index < 5 ? '1px solid #e5e5e5' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '50%', 
                                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
                                        color: 'white', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '6px', color: '#1d1d1f' }}>
                                            {item.title}
                                        </h4>
                                        <p style={{ color: '#666', lineHeight: '1.6', margin: 0, fontSize: '0.9rem' }}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', padding: '50px 40px', borderRadius: '24px', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f', textAlign: 'center' }}>
                        Common Questions
                    </h2>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {[
                            {
                                q: 'How long do batteries last?',
                                a: 'Typically 6-12 months depending on usage. Rechargeable batteries can last 3-6 months per charge.'
                            },
                            {
                                q: 'Can I control blinds when away from home?',
                                a: 'Yes, with Wi-Fi enabled motors or a smart home hub, you can control blinds from anywhere via the app.'
                            },
                            {
                                q: 'Do I need a hub?',
                                a: 'Some motors work standalone via Bluetooth. For remote access and smart home integration, a hub is usually required.'
                            },
                            {
                                q: 'Can I retrofit existing blinds?',
                                a: 'In many cases, yes. Check compatibility with your blind type and consult with our support team.'
                            }
                        ].map((faq, index) => (
                            <div key={index} style={{
                                background: 'white',
                                padding: '20px 24px',
                                borderRadius: '12px',
                                marginBottom: index < 3 ? '16px' : '0'
                            }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                    {faq.q}
                                </h4>
                                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '24px' }}>
                        Ready to upgrade to smart motorized blinds?
                    </p>
                    <Link 
                        to="/products"
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            marginRight: '16px'
                        }}
                    >
                        Shop Smart Blinds
                    </Link>
                    <Link 
                        to="/help"
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: 'white',
                            color: '#fa709a',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            border: '2px solid #fa709a'
                        }}
                    >
                        More Help Topics
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SmartMotors;
