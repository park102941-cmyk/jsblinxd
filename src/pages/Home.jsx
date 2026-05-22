import React, { useEffect, useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Ruler, ThumbsUp, Instagram, Cpu, Smartphone, Rss, Sun, ChevronRight, Star, ShieldAlert, Sparkles, Menu } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import LoadingSpinner from '../components/LoadingSpinner';
import aiAssets from '../lib/aiAssets';

const Home = () => {
    const { currentUser } = useAuth();
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroSlide, setHeroSlide] = useState(0);
    const heroTimerRef = useRef(null);

    const [homeData, setHomeData] = useState({
        hero: {
            title: 'SMART SHADES\nFOR MODERN VIBE',
            subtitle: 'Experience the ultimate convenience with ZSHINE™ technology.',
            imageUrl: aiAssets.rollerHero
        },
        categories: [
            { title: 'Roller Shades', img: aiAssets.rollerHero, link: '/products?category=roller' },
            { title: 'Zebra Shades', img: aiAssets.zebraCat, link: '/products?category=zebra' }
        ],
        popularTitle: 'Most Popular',
        techHighlight: {
            tag: 'ZSHINE™ CORE',
            title: 'Advanced Connectivity',
            description: 'Not just a motor. A ecosystem. Our ZSHINE™ logic enables multi-room synchronization and adaptive light scheduling based on local weather.',
            imageUrl: aiAssets.smartTech,
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
                const products = productsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(p => !p.isHidden && !p.category?.toLowerCase().startsWith('swatch') && !p.title?.startsWith('[Swatch]'));
                setBestSellers(products.slice(0, 4));
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Hero auto-play
    useEffect(() => {
        heroTimerRef.current = setInterval(() => setHeroSlide(s => (s + 1) % 2), 5000);
        return () => clearInterval(heroTimerRef.current);
    }, []);

    const renderIcon = (iconName) => {
        const icons = { Truck, ShieldCheck, Ruler, ThumbsUp, Rss, Smartphone };
        const Icon = icons[iconName];
        return Icon ? <Icon size={24} /> : null;
    };

    if (loading) return <LoadingSpinner fullScreen text="Loading..." />;

    const heroSlides = [
        {
            bg: homeData.hero.imageUrl,
            overlay: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.15))',
            tag: null,
            title: homeData.hero.title,
            subtitle: homeData.hero.subtitle,
            cta1: { label: 'Shop Now', to: '/products' },
            cta2: { label: 'Order Swatches', to: '/swatches' },
        },
        {
            bg: aiAssets.virtualViewHero,
            overlay: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)',
            tag: '✨ NEW FEATURE',
            title: 'See It In\nYour Space',
            subtitle: 'Visualize any blind, any fabric — right on your window. No guesswork, just confidence.',
            cta1: { label: '🪟 Try Virtual View', to: '/products' },
            cta2: { label: 'Learn More', to: '/swatches' },
            accent: true,
        }
    ];

    const goToSlide = (idx) => {
        setHeroSlide(idx);
        clearInterval(heroTimerRef.current);
        heroTimerRef.current = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 5000);
    };

    return (
        <div className="home-container">
            {/* Hero Carousel */}
            <section style={{ position: 'relative', height: '85vh', minHeight: '600px', overflow: 'hidden' }}>
                {/* Slides */}
                {heroSlides.map((slide, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: `url(${slide.bg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: heroSlide === i ? 1 : 0,
                            transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: heroSlide === i ? 1 : 0,
                        }}
                    >
                        <div style={{ position: 'absolute', inset: 0, background: slide.overlay }} />
                        <div style={{
                            position: 'relative', zIndex: 2, height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: slide.accent ? 'flex-start' : 'center',
                            padding: slide.accent ? '0 8%' : '0 20px',
                            color: 'white', maxWidth: slide.accent ? 'none' : '100%'
                        }}>
                            <div
                                className="animate-fade-in-up"
                                style={{ maxWidth: slide.accent ? '560px' : '800px', textAlign: slide.accent ? 'left' : 'center' }}
                            >
                                {slide.tag && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        padding: '6px 16px', borderRadius: '30px',
                                        fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px',
                                        marginBottom: '24px', color: '#fff'
                                    }}>
                                        {slide.tag}
                                    </div>
                                )}
                                <h1 style={{
                                    fontSize: 'clamp(3rem, 7vw, 5.2rem)',
                                    fontWeight: '800',
                                    lineHeight: '1.05',
                                    marginBottom: '20px',
                                    letterSpacing: '-2px',
                                    whiteSpace: 'pre-line',
                                    textShadow: '0 2px 20px rgba(0,0,0,0.3)'
                                }}>
                                    {slide.title}
                                </h1>
                                <p style={{
                                    fontSize: '1.15rem', opacity: 0.92, marginBottom: '40px',
                                    fontWeight: '500', lineHeight: '1.6',
                                    textShadow: '0 1px 8px rgba(0,0,0,0.4)'
                                }}>
                                    {slide.subtitle}
                                </p>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: slide.accent ? 'flex-start' : 'center' }}>
                                    <Link to={slide.cta1.to} className="btn-primary hover-lift" style={{
                                        padding: '15px 35px', borderRadius: '30px',
                                        background: slide.accent ? '#fff' : undefined,
                                        color: slide.accent ? '#1d1d1f' : undefined,
                                        fontWeight: '800', fontSize: '1rem',
                                        boxShadow: slide.accent ? '0 8px 32px rgba(0,0,0,0.2)' : undefined
                                    }}>
                                        {slide.cta1.label}
                                    </Link>
                                    <Link to={slide.cta2.to} className="hover-lift" style={{
                                        padding: '15px 35px', borderRadius: '30px',
                                        backgroundColor: 'rgba(255,255,255,0.12)',
                                        backdropFilter: 'blur(10px)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.35)',
                                        fontWeight: '600', fontSize: '0.95rem',
                                        textDecoration: 'none', display: 'inline-flex', alignItems: 'center'
                                    }}>
                                        {slide.cta2.label}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Dot Indicators */}
                <div style={{
                    position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: '10px', zIndex: 10
                }}>
                    {heroSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goToSlide(i)}
                            style={{
                                width: heroSlide === i ? '32px' : '10px', height: '10px',
                                borderRadius: '5px', border: 'none', cursor: 'pointer',
                                background: heroSlide === i ? '#fff' : 'rgba(255,255,255,0.45)',
                                transition: 'all 0.35s ease', padding: 0
                            }}
                        />
                    ))}
                </div>

                {/* Prev / Next Arrows */}
                {[{ dir: -1, side: 'left' }, { dir: 1, side: 'right' }].map(({ dir, side }) => (
                    <button
                        key={side}
                        onClick={() => goToSlide((heroSlide + dir + heroSlides.length) % heroSlides.length)}
                        style={{
                            position: 'absolute', top: '50%', [side]: '24px',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff', width: '44px', height: '44px', borderRadius: '50%',
                            cursor: 'pointer', fontSize: '1.2rem', zIndex: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                    >
                        {dir === -1 ? '‹' : '›'}
                    </button>
                ))}
            </section>


            {/* Values Bar */}
            <div style={{ backgroundColor: '#f5f5f7', borderBottom: '1px solid #e5e5e5' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', padding: '30px 20px' }}>
                    {(homeData.values && Array.isArray(homeData.values)) && homeData.values.map((v, i) => (
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
                <ScrollReveal animation="fade">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>The Collection</h2>
                        <Link to="/products" style={{ color: 'var(--primary-green)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            View All <ChevronRight size={18} />
                        </Link>
                    </div>
                </ScrollReveal>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                    {(homeData.categories && Array.isArray(homeData.categories)) && homeData.categories.map((cat, i) => (
                        <ScrollReveal key={i} animation="scale" delay={i * 100}>
                            <Link to={cat.link} className="hover-lift" style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', display: 'block' }}>
                                <img src={cat.img} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} alt={cat.title} />
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
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Smart Technology Feature */}
            <section style={{ backgroundColor: '#fcfcfd', color: 'var(--text-main)', overflow: 'hidden', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', alignItems: 'center' }}>
                    <ScrollReveal animation="left">
                        <div style={{ padding: '100px 60px' }}>
                            <span style={{ color: 'var(--primary-green)', fontWeight: '700', letterSpacing: '2px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Smart Ecosystem</span>
                            <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: '20px 0', lineHeight: '1.1', color: '#1d1d1f' }}>Total Control.<br /><span style={{ color: '#86868b' }}>Seamless Integration.</span></h2>
                            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
                                Our complete smart ecosystem brings together precision engineering and modern connectivity for the ultimate window treatment experience.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                {[
                                    { title: '1-Channel Remote', desc: 'Precision control for single shades.' },
                                    { title: '4-Channel Remote', desc: 'Group control for multiple windows.' },
                                    { title: '15-Channel Remote', desc: 'Advanced LCD multi-zone management.' },
                                    { title: 'Smart Bridge Hub', desc: 'Alexa, Google, and App integration.' }
                                ].map((f, i) => (
                                    <div key={i}>
                                        <h4 style={{ margin: '0 0 5px', fontSize: '1rem', fontWeight: '700', color: '#1d1d1f' }}>{f.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal animation="right">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ position: 'relative', height: '500px', backgroundColor: '#f5f5f7', borderRadius: '24px', overflow: 'hidden' }}>
                                <img src={homeData.techHighlight.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Smart Tech" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                <div style={{ height: '140px', background: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee' }}>
                                    <img src={aiAssets.remote2} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} alt="Multi-channel Remote" />
                                </div>
                                <div style={{ height: '140px', background: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee' }}>
                                    <img src={aiAssets.remote3} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} alt="Single-channel Remote" />
                                </div>
                                <div style={{ height: '140px', background: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee' }}>
                                    <img src={aiAssets.remote4} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} alt="15-channel Remote" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="container" style={{ padding: '100px 20px' }}>
                <ScrollReveal animation="fade">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '50px', textAlign: 'center' }}>Most Popular</h2>
                </ScrollReveal>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
                    {bestSellers.map((product, index) => (
                        <ScrollReveal key={product.id} animation="scale" delay={index * 100}>
                            <ProductCard 
                                id={product.id}
                                title={product.title}
                                price={product.basePrice !== undefined ? product.basePrice : (product.price || 9.99)}
                                image={product.images && product.images.length > 0 ? product.images[0] : (product.imageUrl || product.image)}
                                badge={product.badge}
                                reviews={product.reviews || 0}
                                colors={product.colors && Array.isArray(product.colors) ? product.colors.map(c => c ? (typeof c === 'string' ? c : c.hex) : '') : []}
                            />
                        </ScrollReveal>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
