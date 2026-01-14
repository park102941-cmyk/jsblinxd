import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, ArrowLeft, Sun, Moon, Shield, Droplet, Wind, Sparkles, Home, Briefcase } from 'lucide-react';

const HowToChoose = () => {
    const blindTypes = [
        {
            icon: Sun,
            name: 'Roller Shades',
            description: 'Clean, minimalist design with excellent light control',
            bestFor: 'Modern homes, offices, living rooms',
            lightControl: 'Excellent',
            privacy: 'High',
            color: '#667eea'
        },
        {
            icon: Sparkles,
            name: 'Zebra Shades',
            description: 'Alternating sheer and solid fabric for versatile light control',
            bestFor: 'Bedrooms, living rooms, dining areas',
            lightControl: 'Adjustable',
            privacy: 'Medium to High',
            color: '#f093fb'
        },
        {
            icon: Shield,
            name: 'Cellular Shades',
            description: 'Honeycomb structure provides superior insulation',
            bestFor: 'Energy efficiency, noise reduction',
            lightControl: 'Good',
            privacy: 'High',
            color: '#4facfe'
        },
        {
            icon: Wind,
            name: 'Woven Wood Shades',
            description: 'Natural materials for a warm, organic look',
            bestFor: 'Living rooms, sunrooms, rustic decor',
            lightControl: 'Moderate',
            privacy: 'Medium',
            color: '#fa709a'
        }
    ];

    const considerations = [
        {
            icon: Sun,
            title: 'Light Control',
            description: 'Consider how much natural light you want in the room',
            options: [
                { name: 'Blackout', desc: 'Complete darkness for bedrooms' },
                { name: 'Light Filtering', desc: 'Soft, diffused light' },
                { name: 'Sheer', desc: 'Maximum natural light with privacy' }
            ]
        },
        {
            icon: Moon,
            title: 'Privacy Level',
            description: 'Determine your privacy needs for each room',
            options: [
                { name: 'High Privacy', desc: 'Bedrooms, bathrooms' },
                { name: 'Medium Privacy', desc: 'Living rooms, dining rooms' },
                { name: 'Low Privacy', desc: 'Kitchens, home offices' }
            ]
        },
        {
            icon: Droplet,
            title: 'Moisture Resistance',
            description: 'Choose appropriate materials for humid areas',
            options: [
                { name: 'Faux Wood', desc: 'Bathrooms, kitchens' },
                { name: 'Vinyl', desc: 'High humidity areas' },
                { name: 'Fabric', desc: 'Dry areas only' }
            ]
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
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <Lightbulb size={64} style={{ marginBottom: '20px' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 16px 0' }}>
                    How To Choose Blinds & Shades
                </h1>
                <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', opacity: 0.95 }}>
                    Find the perfect window treatment for your space and lifestyle
                </p>
            </div>

            {/* Content */}
            <div className="container" style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
                {/* Blind Types Comparison */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px', color: '#1d1d1f', textAlign: 'center' }}>
                        Compare Blind Types
                    </h2>
                    <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px auto' }}>
                        Each type of blind offers unique benefits. Choose based on your needs and preferences.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                        {blindTypes.map((type, index) => {
                            const Icon = type.icon;
                            return (
                                <div key={index} style={{
                                    background: 'white',
                                    padding: '30px',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    border: '2px solid transparent'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                                    e.currentTarget.style.borderColor = type.color;
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
                                        background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}dd 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <Icon size={28} color="white" />
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>
                                        {type.name}
                                    </h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
                                        {type.description}
                                    </p>
                                    <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '16px' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', fontWeight: '600' }}>Best For:</span>
                                            <p style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0' }}>{type.bestFor}</p>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: '#999', display: 'block' }}>Light Control</span>
                                                <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: '500' }}>{type.lightControl}</span>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: '#999', display: 'block' }}>Privacy</span>
                                                <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: '500' }}>{type.privacy}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Key Considerations */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '40px', color: '#1d1d1f', textAlign: 'center' }}>
                        Key Considerations
                    </h2>
                    <div style={{ display: 'grid', gap: '40px' }}>
                        {considerations.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Icon size={28} color="white" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                                {item.title}
                                            </h3>
                                            <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        {item.options.map((option, optIndex) => (
                                            <div key={optIndex} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#1d1d1f' }}>
                                                    {option.name}
                                                </h4>
                                                <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, lineHeight: '1.5' }}>
                                                    {option.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Room-by-Room Guide */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '40px', color: '#1d1d1f', textAlign: 'center' }}>
                        Room-by-Room Guide
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        {[
                            {
                                icon: Home,
                                room: 'Living Room',
                                recommendation: 'Roller or Zebra Shades',
                                reason: 'Versatile light control and modern aesthetics',
                                tips: ['Light filtering for daytime', 'Motorization for convenience', 'Neutral colors for flexibility']
                            },
                            {
                                icon: Moon,
                                room: 'Bedroom',
                                recommendation: 'Blackout Roller or Cellular Shades',
                                reason: 'Complete darkness for better sleep',
                                tips: ['Blackout fabric essential', 'Top-down/bottom-up option', 'Quiet operation for peace']
                            },
                            {
                                icon: Briefcase,
                                room: 'Home Office',
                                recommendation: 'Cellular or Roller Shades',
                                reason: 'Glare reduction and energy efficiency',
                                tips: ['Anti-glare fabrics', 'Motorized for video calls', 'Neutral tones reduce eye strain']
                            },
                            {
                                icon: Droplet,
                                room: 'Bathroom',
                                recommendation: 'Faux Wood or Vinyl Blinds',
                                reason: 'Moisture-resistant materials',
                                tips: ['Water-resistant fabrics', 'Easy to clean', 'Privacy is priority']
                            }
                        ].map((guide, index) => {
                            const Icon = guide.icon;
                            return (
                                <div key={index} style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <Icon size={24} color="white" />
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>
                                        {guide.room}
                                    </h3>
                                    <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                                            Recommended
                                        </span>
                                        <span style={{ fontSize: '0.95rem', color: '#667eea', fontWeight: '600' }}>
                                            {guide.recommendation}
                                        </span>
                                    </div>
                                    <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '16px' }}>
                                        {guide.reason}
                                    </p>
                                    <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '16px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '12px' }}>
                                            Tips:
                                        </span>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '0.85rem', lineHeight: '1.8' }}>
                                            {guide.tips.map((tip, tipIndex) => (
                                                <li key={tipIndex}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Decision Helper */}
                <div style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', padding: '50px 40px', borderRadius: '24px', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1d1d1f', textAlign: 'center' }}>
                        Quick Decision Helper
                    </h2>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {[
                            { question: 'Need complete darkness?', answer: 'Choose Blackout Roller Shades' },
                            { question: 'Want energy efficiency?', answer: 'Choose Cellular (Honeycomb) Shades' },
                            { question: 'Looking for natural aesthetics?', answer: 'Choose Woven Wood Shades' },
                            { question: 'Need flexible light control?', answer: 'Choose Zebra Shades' },
                            { question: 'High humidity area?', answer: 'Choose Faux Wood or Vinyl' },
                            { question: 'Want smart home integration?', answer: 'Add Motorization' }
                        ].map((item, index) => (
                            <div key={index} style={{
                                background: 'white',
                                padding: '20px 24px',
                                borderRadius: '12px',
                                marginBottom: index < 5 ? '16px' : '0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <span style={{ fontSize: '1rem', color: '#333', fontWeight: '500' }}>
                                    {item.question}
                                </span>
                                <span style={{ 
                                    fontSize: '0.9rem', 
                                    color: 'white', 
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontWeight: '500'
                                }}>
                                    {item.answer}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '24px' }}>
                        Still not sure which blinds are right for you?
                    </p>
                    <Link 
                        to="/help"
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            marginRight: '16px'
                        }}
                    >
                        Contact Our Experts
                    </Link>
                    <Link 
                        to="/products"
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: 'white',
                            color: '#4facfe',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            border: '2px solid #4facfe'
                        }}
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HowToChoose;
