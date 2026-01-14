import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import SidebarFilter from '../components/SidebarFilter';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Swatches = () => {
    const [searchParams] = useSearchParams();
    const activeCategory = searchParams.get('category');

    // State for Collapsible Sections
    const [sections, setSections] = useState({
        zebra: true,
        roller: true
    });

    // Product State
    const [zebraSwatches, setZebraSwatches] = useState([]);
    const [rollerSwatches, setRollerSwatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Auto-expand/collapse based on sidebar selection
    useEffect(() => {
        if (activeCategory === 'swatch-zebra') {
            setSections({ zebra: true, roller: false });
        } else if (activeCategory === 'swatch-roller') {
            setSections({ zebra: false, roller: true });
        } else {
            setSections({ zebra: true, roller: true });
        }
    }, [activeCategory]);

    useEffect(() => {
        const fetchSwatches = async () => {
            setLoading(true);
            try {
                // Fetch all products for now and filter, or use simple queries
                const q = collection(db, "products");
                const querySnapshot = await getDocs(q);
                const allProducts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter for Swatches
                // Note: In Admin we saved categories as 'swatch-zebra' and 'swatch-roller'
                const zebra = allProducts.filter(p => p.category === 'swatch-zebra');
                const roller = allProducts.filter(p => p.category === 'swatch-roller');

                setZebraSwatches(zebra);
                setRollerSwatches(roller);

            } catch (error) {
                console.error("Error fetching swatches:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSwatches();
    }, []);


    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Category Sidebar Data matching Admin category values
    const swatchCategories = [
        { label: "All Swatches", key: null },
        { label: "Zebra Shade", key: "swatch-zebra" },
        { label: "Roller Shade", key: "swatch-roller" }
    ];

    // Helper for color extraction
    const extractColorImages = (colors) => {
        if (!Array.isArray(colors)) return [];
        return colors.map(c => typeof c === 'string' ? c : (c.image || c.hex));
    };

    // Helper Component for Swatch Listing
    const SwatchGrid = ({ products }) => {
        if (products.length === 0) return <div style={{ padding: '20px', color: '#888', fontStyle: 'italic' }}>No swatches available yet.</div>;
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', padding: '10px 0' }}>
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.basePrice}
                        image={product.imageUrl}
                        badge={product.badge}
                        reviews={product.reviews || 0}
                        questions={product.questions || 0}
                        colors={extractColorImages(product.colors)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="container" style={{ padding: '40px 20px', display: 'flex' }}>

            {/* 1. Reuse Sidebar with Custom Categories */}
            <div style={{ marginRight: '40px', display: 'block' }}> {/* Visible on Desktop */}
                <SidebarFilter categories={swatchCategories} />
            </div>

            {/* 2. Main Content with Accordions */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '30px', fontSize: '0.9rem', color: '#666' }}>
                    Collection / SWATCHES
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Simpler & Smarter Fabric Swatches</h1>

                {loading ? <div>Loading swatches...</div> : (
                    <>
                        {/* Zebra Section */}
                        <div style={{ borderBottom: '1px solid #eee', marginBottom: '20px' }}>
                            <div
                                onClick={() => toggleSection('zebra')}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '15px' }}
                            >
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Zebra Shade</h2>
                                {sections.zebra ? <ChevronUp /> : <ChevronDown />}
                            </div>
                            {sections.zebra && <SwatchGrid products={zebraSwatches} />}
                        </div>

                        {/* Roller Section */}
                        <div style={{ borderBottom: '1px solid #eee', marginBottom: '20px' }}>
                            <div
                                onClick={() => toggleSection('roller')}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '15px' }}
                            >
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Roller Shade</h2>
                                {sections.roller ? <ChevronUp /> : <ChevronDown />}
                            </div>
                            {sections.roller && <SwatchGrid products={rollerSwatches} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Swatches;
