import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Sliders, Sun, ChevronRight, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const FeatureCard = ({ icon, title, description }) => (
    <div style={{
        textAlign: 'center',
        padding: '30px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s ease',
        cursor: 'default'
    }}>
        <div style={{ color: 'var(--primary-green)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>{title}</h3>
        <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95rem' }}>{description}</p>
    </div>
);

const AboutUs = () => {
    const [content, setContent] = useState({
        heroTitle: 'WHY JSBlind',
        heroSubtitle: 'Innovating window treatments for the modern smart home.',
        introTitle: 'Technology Meets Craftsmanship',
        introText: 'At JSBlind, we believe your window treatments should do more than just block light. They should integrate seamlessly into your life, offering convenience, style, and energy efficiency. Our mission is to bring premium, custom-fit smart blinds to every home without the premium markup.'
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const docRef = doc(db, "content_pages", "about_us");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setContent(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                console.error("Error fetching About Us content:", error);
            }
        };
        fetchContent();
    }, []);

    return (
        <div style={{ paddingBottom: '80px', background: '#F9F9FB' }}>
            {/* Hero Section */}
            <div style={{
                position: 'relative',
                height: '400px',
                background: 'var(--secondary-olive)', // Placeholder for a hero image
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: 'white',
                textAlign: 'center'
            }}>
                {/* Overlay or Image would go here */}
                <div style={{ zIndex: 2, padding: '20px' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '2px' }}>{content.heroTitle}</h1>
                    <p style={{ fontSize: '1.2rem', fontWeight: '300', maxWidth: '600px', margin: '0 auto' }}>{content.heroSubtitle}</p>
                </div>
            </div>

            {/* Introduction */}
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '800px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '400', marginBottom: '30px', color: '#333' }}>
                    {content.introTitle}
                </h2>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', whiteSpace: 'pre-line' }}>
                    {content.introText}
                </p>
            </div>

            {/* Features Grid - Static for now as these are core value props */}
            <div className="container" style={{ padding: '0 20px 80px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '30px'
                }}>
                    <FeatureCard
                        icon={<Cpu size={48} />}
                        title="Smart Home Integration"
                        description="Compatible with Alexa, Google Home, and Apple HomeKit. Control your shades with voice commands or set schedules for automatic adjustments."
                    />
                    <FeatureCard
                        icon={<Truck size={48} />}
                        title="JSBlind™ Factory Direct"
                        description="By shipping directly from our JSBlind™ high-tech facility, we eliminate middleman markups, delivering premium smart blinds at a fraction of local retail prices."
                    />
                    <FeatureCard
                        icon={<ShieldCheck size={48} />}
                        title="No-Return Guarantee"
                        description="Our 'No-Hassle Replacement' policy means if there's a manufacturing defect, we'll ship a replacement without requiring a return. Your time is our priority."
                    />
                    <FeatureCard
                        icon={<Sun size={48} />}
                        title="Energy Efficiency"
                        description="Our honeycombs and thermal fabrics provide superior insulation, keeping your home cooler in summer and warmer in winter."
                    />
                </div>
            </div>

            {/* Call to Action */}
            <div style={{
                background: '#fff',
                padding: '80px 20px',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '30px', color: '#333' }}>Ready to Upgrade Your View?</h2>
                <Link to="/products" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                    Shop Collection <ChevronRight size={20} style={{ marginLeft: '10px' }} />
                </Link>
            </div>
        </div>
    );
};

export default AboutUs;
