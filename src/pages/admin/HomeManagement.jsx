import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const Section = ({ title, isOpen, toggle, children }) => (
    <div style={{ border: '1px solid #eee', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
        <div
            onClick={toggle}
            style={{
                padding: '15px 20px',
                background: '#f9f9f9',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 'bold'
            }}
        >
            <span>{title}</span>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {isOpen && <div style={{ padding: '20px' }}>{children}</div>}
    </div>
);

const HomeManagement = () => {
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('hero');
    const [homeData, setHomeData] = useState({
        // Hero
        hero: {
            title: '',
            subtitle: '',
            imageUrl: ''
        },
        // Categories (Diverse Solutions)
        categories: [],
        // Best Sellers Title
        popularTitle: 'Most Popular',
        // Smart Tech Highlight
        techHighlight: {
            tag: 'JSBlind™ CORE',
            title: 'Advanced Connectivity',
            description: 'Not just a motor. A ecosystem. Our JSBlind™ logic enables multi-room synchronization and adaptive light scheduling based on local weather.',
            imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=1000',
            features: [
                { title: 'Matter Standard', desc: 'Universal compatibility.', icon: 'Rss' },
                { title: 'Full App Control', desc: 'iOS and Android ready.', icon: 'Smartphone' }
            ]
        },
        // Value Items (Bottom Bar)
        values: []
    });

    // Initial Defaults
    const defaultData = {
        hero: {
            title: 'SMART SHADES\nFOR MODERN VIBE',
            subtitle: 'Experience the ultimate convenience with JSBlind™ technology.',
            imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
        },
        categories: [
            { title: 'Roller Shades', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600', link: '/products?category=roller' },
            { title: 'Zebra Shades', img: 'https://images.unsplash.com/photo-1505691938895-1758d7bab58d?w=600', link: '/products?category=zebra' },
            { title: 'Cellular Shades', img: 'https://images.unsplash.com/photo-1522771753062-5a49c1284524?w=600', link: '/products?category=cellular' },
            { title: 'Smart Curtains', img: 'https://images.unsplash.com/photo-1558603668-6570496b66f8?w=600', link: '/products?category=curtains' },
            { title: 'Roman Shades', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600', link: '/products?category=roman' },
            { title: 'Outdoor Tech', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', link: '/products?category=outdoor' }
        ],
        popularTitle: 'Most Popular',
        techHighlight: {
            tag: 'JSBlind™ CORE',
            title: 'Advanced Connectivity',
            description: 'Not just a motor. A ecosystem. Our JSBlind™ logic enables multi-room synchronization and adaptive light scheduling based on local weather.',
            imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=1000',
            features: [
                { title: 'Matter Standard', desc: 'Universal compatibility.', icon: 'Rss' },
                { title: 'Full App Control', desc: 'iOS and Android ready.', icon: 'Smartphone' }
            ]
        },
        values: [
            { icon: 'Truck', title: 'FAST AIR SHIPPING', desc: 'Free over $300' },
            { icon: 'ShieldCheck', title: '5 YEAR WARRANTY', desc: 'Peace of mind' },
            { icon: 'Ruler', title: 'PERFECT FIT', desc: 'Guaranteed size' },
            { icon: 'ThumbsUp', title: 'US SUPPORT', desc: 'Based in Texas' }
        ]
    };

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const docRef = doc(db, "siteContent", "home");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Merge with defaults to ensure structure exists
                    setHomeData({ ...defaultData, ...data });
                    // Handle legacy data structure where hero fields were root
                    if (data.title && !data.hero) {
                        setHomeData(prev => ({
                            ...prev,
                            hero: {
                                title: data.title,
                                subtitle: data.subtitle,
                                imageUrl: data.imageUrl
                            }
                        }));
                    }
                } else {
                    setHomeData(defaultData);
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
                setHomeData(defaultData);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, "siteContent", "home"), homeData);
            alert('Home page updated successfully!');
        } catch (error) {
            console.error("Error updating home page:", error);
            alert('Failed to update home page.');
        }
    };

    // Generic Handlers
    const updateField = (section, field, value) => {
        setHomeData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateArrayItem = (section, index, field, value) => {
        setHomeData(prev => {
            const newArray = [...prev[section]];
            if (typeof newArray[index] === 'object') {
                newArray[index] = { ...newArray[index], [field]: value };
            } else {
                newArray[index] = value;
            }
            return { ...prev, [section]: newArray };
        });
    };

    const addItem = (section, template) => {
        setHomeData(prev => ({
            ...prev,
            [section]: [...prev[section], template]
        }));
    };

    const removeItem = (section, index) => {
        setHomeData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    if (loading) return <div>Loading...</div>;

    const InputGroup = ({ label, value, onChange, type = "text", help }) => (
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>{label}</label>
            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                />
            ) : (
                <input
                    type={type}
                    value={value || ''}
                    onChange={onChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
            )}
            {help && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{help}</p>}
        </div>
    );

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>Home Page Management</h2>
                <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 20px' }}>Save All Changes</button>
            </div>

            <form onSubmit={handleSave} style={{ maxWidth: '800px' }}>

                {/* Hero Section */}
                <Section title="Hero Section" isOpen={activeSection === 'hero'} toggle={() => setActiveSection(activeSection === 'hero' ? '' : 'hero')}>
                    <InputGroup
                        label="Hero Title"
                        value={homeData.hero.title}
                        onChange={(e) => updateField('hero', 'title', e.target.value)}
                    />
                    <InputGroup
                        label="Hero Subtitle"
                        value={homeData.hero.subtitle}
                        onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                    />
                    <InputGroup
                        label="Hero Image URL"
                        value={homeData.hero.imageUrl}
                        onChange={(e) => updateField('hero', 'imageUrl', e.target.value)}
                    />
                    <div style={{ marginTop: '10px', height: '150px', background: `url(${homeData.hero.imageUrl}) center/cover`, borderRadius: '4px' }}></div>
                </Section>

                {/* Diverse Solutions Section */}
                <Section title="Diverse Solutions (Categories)" isOpen={activeSection === 'categories'} toggle={() => setActiveSection(activeSection === 'categories' ? '' : 'categories')}>
                    {homeData.categories.map((item, idx) => (
                        <div key={idx} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '10px', position: 'relative' }}>
                            <button
                                type="button"
                                onClick={() => removeItem('categories', idx)}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                            <InputGroup label="Title" value={item.title} onChange={(e) => updateArrayItem('categories', idx, 'title', e.target.value)} />
                            <InputGroup label="Image URL" value={item.img} onChange={(e) => updateArrayItem('categories', idx, 'img', e.target.value)} />
                            <InputGroup label="Link" value={item.link} onChange={(e) => updateArrayItem('categories', idx, 'link', e.target.value)} />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addItem('categories', { title: 'New Solution', img: '', link: '/products' })}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        <Plus size={16} /> Add Solution
                    </button>
                </Section>

                {/* Popular Title */}
                <Section title="Best Sellers Title" isOpen={activeSection === 'popular'} toggle={() => setActiveSection(activeSection === 'popular' ? '' : 'popular')}>
                    <InputGroup
                        label="Section Title"
                        value={homeData.popularTitle}
                        onChange={(e) => setHomeData(prev => ({ ...prev, popularTitle: e.target.value }))}
                    />
                </Section>

                {/* Tech Highlight Section */}
                <Section title="Tech Highlight Section" isOpen={activeSection === 'tech'} toggle={() => setActiveSection(activeSection === 'tech' ? '' : 'tech')}>
                    <InputGroup
                        label="Tagline"
                        value={homeData.techHighlight.tag}
                        onChange={(e) => updateField('techHighlight', 'tag', e.target.value)}
                    />
                    <InputGroup
                        label="Title"
                        value={homeData.techHighlight.title}
                        onChange={(e) => updateField('techHighlight', 'title', e.target.value)}
                    />
                    <InputGroup
                        label="Description"
                        type="textarea"
                        value={homeData.techHighlight.description}
                        onChange={(e) => updateField('techHighlight', 'description', e.target.value)}
                    />
                    <InputGroup
                        label="Image URL"
                        value={homeData.techHighlight.imageUrl}
                        onChange={(e) => updateField('techHighlight', 'imageUrl', e.target.value)}
                    />

                    <div style={{ marginTop: '20px' }}>
                        <label style={{ fontWeight: 'bold' }}>Features</label>
                        {homeData.techHighlight.features.map((feature, idx) => (
                            <div key={idx} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '10px' }}>
                                <InputGroup label="Feature Title" value={feature.title} onChange={(e) => {
                                    const newFeatures = [...homeData.techHighlight.features];
                                    newFeatures[idx].title = e.target.value;
                                    updateField('techHighlight', 'features', newFeatures);
                                }} />
                                <InputGroup label="Feature Desc" value={feature.desc} onChange={(e) => {
                                    const newFeatures = [...homeData.techHighlight.features];
                                    newFeatures[idx].desc = e.target.value;
                                    updateField('techHighlight', 'features', newFeatures);
                                }} />
                                <InputGroup label="Icon (Lucide name)" value={feature.icon} onChange={(e) => {
                                    const newFeatures = [...homeData.techHighlight.features];
                                    newFeatures[idx].icon = e.target.value;
                                    updateField('techHighlight', 'features', newFeatures);
                                }} help="Available: Rss, Smartphone, Cpu, Menu, etc." />
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Value Items Section */}
                <Section title="Bottom Value Bar" isOpen={activeSection === 'values'} toggle={() => setActiveSection(activeSection === 'values' ? '' : 'values')}>
                    {homeData.values.map((item, idx) => (
                        <div key={idx} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '10px', position: 'relative' }}>
                            <button
                                type="button"
                                onClick={() => removeItem('values', idx)}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                            <InputGroup label="Title" value={item.title} onChange={(e) => updateArrayItem('values', idx, 'title', e.target.value)} />
                            <InputGroup label="Description" value={item.desc} onChange={(e) => updateArrayItem('values', idx, 'desc', e.target.value)} />
                            <InputGroup label="Icon Name" value={item.icon} onChange={(e) => updateArrayItem('values', idx, 'icon', e.target.value)} />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addItem('values', { title: 'New Value', desc: '', icon: 'Truck' })}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        <Plus size={16} /> Add Value Item
                    </button>
                </Section>

            </form>
        </div>
    );
};

export default HomeManagement;
