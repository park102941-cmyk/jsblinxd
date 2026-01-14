import React from 'react';
import { Link } from 'react-router-dom';
import { Ruler, Wrench, Lightbulb, Cpu, Phone, Mail, MapPin, Clock, Package, Shield, Download } from 'lucide-react';
import { generateMeasurePDF, generateInstallPDF, generateChoosePDF, generateSmartMotorsPDF, generateCompletePDF } from '../utils/pdfGenerator';

const Help = () => {
    const helpCategories = [
        {
            icon: Ruler,
            title: 'How To Measure for Blinds & Shades',
            description: 'Learn the proper way to measure your windows for a perfect fit. Get step-by-step instructions for inside and outside mount measurements.',
            link: '/help/how-to-measure',
            color: '#667eea'
        },
        {
            icon: Wrench,
            title: 'How To Install Blinds & Shades',
            description: 'Easy-to-follow installation guides for all our products. Includes video tutorials and downloadable PDF instructions.',
            link: '/help/how-to-install',
            color: '#f093fb'
        },
        {
            icon: Lightbulb,
            title: 'How To Choose Blinds & Shades',
            description: 'Find the perfect window treatment for your space. Compare different styles, materials, and features to make the right choice.',
            link: '/help/how-to-choose',
            color: '#4facfe'
        },
        {
            icon: Cpu,
            title: 'How To Choose Smart Motors',
            description: 'Understand the different motorization options available. Learn about compatibility with smart home systems like Alexa, Google Home, and HomeKit.',
            link: '/help/smart-motors',
            color: '#fa709a'
        }
    ];

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            {/* Hero Section */}
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '80px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 20px 0' }}>
                    Help Center
                </h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px auto', opacity: 0.95 }}>
                    Everything you need to know about measuring, installing, and choosing the perfect blinds and shades
                </p>
                
                {/* PDF Download Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '30px' }}>
                    <button
                        onClick={generateCompletePDF}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'white',
                            color: '#667eea',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                    >
                        <Download size={20} />
                        Download Complete Guide (PDF)
                    </button>
                    
                    <button
                        onClick={generateMeasurePDF}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '2px solid white',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        }}
                    >
                        <Download size={18} />
                        Measuring Guide
                    </button>
                    
                    <button
                        onClick={generateInstallPDF}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '2px solid white',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        }}
                    >
                        <Download size={18} />
                        Installation Guide
                    </button>
                    
                    <button
                        onClick={generateChoosePDF}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '2px solid white',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        }}
                    >
                        <Download size={18} />
                        Choosing Guide
                    </button>
                    
                    <button
                        onClick={generateSmartMotorsPDF}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '2px solid white',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        }}
                    >
                        <Download size={18} />
                        Smart Motors Guide
                    </button>
                </div>
            </div>

            {/* Help Categories Grid */}
            <div className="container" style={{ padding: '80px 20px' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '30px',
                    marginBottom: '80px'
                }}>
                    {helpCategories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={index}
                                to={category.link}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div style={{
                                    background: 'white',
                                    padding: '40px 30px',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '2px solid transparent'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                                    e.currentTarget.style.borderColor = category.color;
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '24px'
                                    }}>
                                        <Icon size={32} color="white" />
                                    </div>
                                    <h3 style={{ 
                                        fontSize: '1.3rem', 
                                        fontWeight: '600', 
                                        marginBottom: '16px',
                                        color: '#1d1d1f'
                                    }}>
                                        {category.title}
                                    </h3>
                                    <p style={{ 
                                        fontSize: '0.95rem', 
                                        lineHeight: '1.6', 
                                        color: '#666',
                                        margin: 0
                                    }}>
                                        {category.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Contact Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: '24px',
                    padding: '60px 40px',
                    marginBottom: '60px'
                }}>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        textAlign: 'center', 
                        marginBottom: '16px',
                        color: '#1d1d1f'
                    }}>
                        Need Some Help?
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        fontSize: '1.1rem', 
                        color: '#666', 
                        marginBottom: '40px',
                        maxWidth: '600px',
                        margin: '0 auto 40px auto'
                    }}>
                        Our customer support team is here to assist you with any questions
                    </p>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '30px',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}>
                        {/* Phone */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px auto'
                            }}>
                                <Phone size={28} color="white" />
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                Call Us
                            </h4>
                            <a href="tel:+18777627861" style={{ 
                                color: 'var(--primary-green)', 
                                textDecoration: 'none', 
                                fontSize: '1.1rem',
                                fontWeight: '500'
                            }}>
                                +1 (877) 762-7861
                            </a>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px', 
                                marginTop: '8px',
                                color: '#666',
                                fontSize: '0.85rem'
                            }}>
                                <Clock size={14} />
                                <span>8 AM - 7 PM CST (Mon-Sat)</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px auto'
                            }}>
                                <Mail size={28} color="white" />
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                Email Us
                            </h4>
                            <a href="mailto:" style={{ 
                                color: 'var(--primary-green)', 
                                textDecoration: 'none', 
                                fontSize: '0.95rem',
                                display: 'block',
                                marginBottom: '4px'
                            }}>
                                
                            </a>
                            <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
                                We'll respond within 24 hours
                            </p>
                        </div>

                        {/* Location */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px auto'
                            }}>
                                <MapPin size={28} color="white" />
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                Visit Us
                            </h4>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
                                5900 Balcones Dr Ste 100<br />
                                Austin, TX 78731-4298
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '30px',
                    marginBottom: '60px'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <Package size={28} color="white" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>
                            Free Shipping
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
                            Free shipping on all orders within the United States with no minimum purchase required
                        </p>
                    </div>

                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <Shield size={28} color="white" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>
                            3 Year Warranty
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
                            Get a 3-year warranty on motors and controls for our smart blinds and shades
                        </p>
                    </div>

                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <Lightbulb size={28} color="white" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>
                            Expert Support
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
                            Our team of experts is ready to help you choose the perfect window treatments
                        </p>
                    </div>
                </div>

                {/* FAQ Preview */}
                <div style={{
                    background: 'white',
                    padding: '50px 40px',
                    borderRadius: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        textAlign: 'center', 
                        marginBottom: '40px',
                        color: '#1d1d1f'
                    }}>
                        Frequently Asked Questions
                    </h2>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {[
                            {
                                q: 'How long does shipping take?',
                                a: 'Most orders ship within 3-5 business days. Custom orders may take 7-10 business days. You\'ll receive tracking information once your order ships.'
                            },
                            {
                                q: 'Can I install the blinds myself?',
                                a: 'Yes! Our blinds come with detailed installation instructions and video tutorials. Most customers can install them in under 30 minutes with basic tools.'
                            },
                            {
                                q: 'What if my blinds don\'t fit?',
                                a: 'We offer free remakes if there\'s an error in manufacturing. If you measured incorrectly, we can remake them at a discounted rate.'
                            },
                            {
                                q: 'Are smart motors compatible with my smart home?',
                                a: 'Our motors work with Alexa, Google Home, Apple HomeKit, and SmartThings. Check the product page for specific compatibility details.'
                            }
                        ].map((faq, index) => (
                            <div key={index} style={{
                                padding: '24px 0',
                                borderBottom: index < 3 ? '1px solid #e5e5e5' : 'none'
                            }}>
                                <h4 style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: '600', 
                                    marginBottom: '12px',
                                    color: '#1d1d1f'
                                }}>
                                    {faq.q}
                                </h4>
                                <p style={{ 
                                    color: '#666', 
                                    fontSize: '0.95rem', 
                                    lineHeight: '1.6',
                                    margin: 0
                                }}>
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <Link 
                            to="/support"
                            style={{
                                display: 'inline-block',
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            View All FAQs
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
