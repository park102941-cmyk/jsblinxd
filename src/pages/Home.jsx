import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Ruler, ThumbsUp, Instagram, Cpu, Smartphone, Rss, Sun, ChevronRight, Star, ShieldAlert, Sparkles, Menu } from 'lucide-react';

const Home = () => {
    const { currentUser } = useAuth();
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [homeData, setHomeData] = useState({
        hero: {
            title: 'SMART SHADES\nFOR MODERN VIBE',
            subtitle: 'Experience the ultimate convenience with ZSHINE™ technology.',
            imageUrl: '/images/hero.png'
        },
        categories: [
            { title: 'Roller Shades', img: '/images/roller.png', link: '/products?category=roller' },
            { title: 'Zebra Shades', img: '/images/zebra.png', link: '/products?category=zebra' },
            { title: 'Cellular Shades', img: 'https://images.unsplash.com/photo-1522771753062-5a49c1284524?w=600', link: '/products?category=cellular' },
            { title: 'Smart Curtains', img: 'https://images.unsplash.com/photo-1558603668-6570496b66f8?w=600', link: '/products?category=curtains' },
            { title: 'Roman Shades', img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600', link: '/products?category=roman' },
            { title: 'Outdoor Tech', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', link: '/products?category=outdoor' }
        ],
        popularTitle: 'Most Popular',
        techHighlight: {
            tag: 'ZSHINE™ CORE',
            title: 'Advanced Connectivity',
            description: 'Not just a motor. A ecosystem. Our ZSHINE™ logic enables multi-room synchronization and adaptive light scheduling based on local weather.',
            imageUrl: '/images/smart-tech.png',
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
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Home Content
                const homeSnap = await getDoc(doc(db, "siteContent", "home"));
                if (homeSnap.exists()) {
                    const data = homeSnap.data();
                    // Handle Legacy Data Structure
                    const processedData = { ...data };
                    if (data.title && !data.hero) {
                        processedData.hero = {
                            title: data.title,
                            subtitle: data.subtitle,
                            imageUrl: data.imageUrl
                        };
                    }
                    if (data.collections && !data.categories) {
                        processedData.categories = data.collections;
                    }

                    // Merge with defaults but prefer Firestore values if they are valid
                    setHomeData(prev => ({
                        ...prev,
                        ...processedData,
                        hero: {
                            ...prev.hero,
                            ...(processedData.hero || {}),
                            // Force local images if firestore has missing/old ones
                            imageUrl: (processedData.hero?.imageUrl && !processedData.hero.imageUrl.includes('placeholder')) 
                                ? processedData.hero.imageUrl 
                                : prev.hero.imageUrl
                        },
                        categories: (processedData.categories || prev.categories).map((cat, idx) => ({
                            ...prev.categories[idx],
                            ...cat,
                            img: (cat.img && !cat.img.includes('placeholder')) ? cat.img : prev.categories[idx]?.img
                        })),
                        techHighlight: {
                            ...prev.techHighlight,
                            ...(processedData.techHighlight || {}),
                            imageUrl: (processedData.techHighlight?.imageUrl && !processedData.techHighlight.imageUrl.includes('placeholder'))
                                ? processedData.techHighlight.imageUrl
                                : prev.techHighlight.imageUrl
                        }
                    }));
                }

                // 2. Best Sellers (Products)
                const productsSnap = await getDocs(collection(db, "products"));
                const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBestSellers(products.slice(0, 4));
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderIcon = (iconName) => {
        const icons = { Truck, ShieldCheck, Ruler, ThumbsUp, Rss, Smartphone };
        const Icon = icons[iconName];
        return Icon ? <Icon size={24} /> : null;
    };

    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section 
                className="hero-section"
                style={{
                    position: 'relative',
                    height: '85vh',
                    minHeight: '600px',
                    backgroundColor: '#1d1d1f',
                    backgroundImage: `url(${homeData.hero.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0, bottom: 0,
                    background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.1))'
                }}></div>
                
                <div className="container" style={{ position: 'relative', textAlign: 'center', maxWidth: '800px' }}>
                    <h1 style={{ 
                        fontSize: 'clamp(3rem, 8vw, 5rem)', 
                        fontWeight: '800', 
                        lineHeight: '1.1', 
                        marginBottom: '20px',
                        letterSpacing: '-2px',
                        whiteSpace: 'pre-line' 
                    }}>
                        {homeData.hero.title}
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '40px', fontWeight: '500' }}>
                        {homeData.hero.subtitle}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <Link to="/products" className="btn-primary" style={{ padding: '15px 35px', borderRadius: '30px' }}>
                            Shop Now
                        </Link>
                        <Link to="/swatches" className="btn-secondary" style={{ padding: '15px 35px', borderRadius: '30px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                            Free Swatches
                        </Link>
                    </div>
                </div>
            </section>

            {/* Values Bar */}
            <div style={{ backgroundColor: '#f5f5f7', borderBottom: '1px solid #e5e5e5' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', padding: '30px 20px' }}>
                    {homeData.values.map((v, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px' }}>
                            <div style={{ color: 'var(--primary-blue)' }}>{renderIcon(v.icon)}</div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>{v.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>{v.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Collections Grid */}
            <section className="container" style={{ padding: '100px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>The Collection</h2>
                    <Link to="/products" style={{ color: 'var(--primary-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        View All <ChevronRight size={18} />
                    </Link>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                    {homeData.categories.map((cat, i) => (
                        <Link to={cat.link} key={i} style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', display: 'block' }}>
                            <img src={cat.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={cat.title} />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '40px',
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                                color: 'white'
                            }}>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px' }}>{cat.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                                    Explore <ChevronRight size={16} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Smart Technology Feature */}
            <section style={{ backgroundColor: '#fcfcfd', color: 'var(--text-main)', overflow: 'hidden', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', alignItems: 'center' }}>
                    <div style={{ padding: '100px 60px' }}>
                        <span style={{ color: 'var(--primary-green)', fontWeight: '700', letterSpacing: '2px', fontSize: '0.9rem' }}>{homeData.techHighlight.tag}</span>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: '20px 0', lineHeight: '1.1', color: '#1d1d1f' }}>{homeData.techHighlight.title}</h2>
                        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>{homeData.techHighlight.description}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            {homeData.techHighlight.features.map((f, i) => (
                                <div key={i}>
                                    <div style={{ color: 'var(--primary-green)', marginBottom: '15px' }}>{renderIcon(f.icon)}</div>
                                    <h4 style={{ margin: '0 0 5px', fontSize: '1rem', fontWeight: '700', color: '#1d1d1f' }}>{f.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: '700px', backgroundColor: '#f5f5f7' }}>
                        <img src={homeData.techHighlight.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply' }} alt="Smart Tech" />
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="container" style={{ padding: '100px 20px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '50px', textAlign: 'center' }}>Most Popular</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
                    {bestSellers.map(product => (
                        <ProductCard 
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            price={product.basePrice}
                            image={product.imageUrl}
                            badge={product.badge}
                            reviews={product.reviews || 0}
                            colors={product.colors && Array.isArray(product.colors) ? product.colors.map(c => typeof c === 'string' ? c : c.hex) : []}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
