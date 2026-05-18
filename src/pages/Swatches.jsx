import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ChevronDown, ChevronUp, Plus, Minus, Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SidebarFilter from '../components/SidebarFilter';

const Swatches = () => {
    const [searchParams] = useSearchParams();
    const fromProductName = searchParams.get('productName');
    const activeCategory = searchParams.get('category');
    const { addToCart } = useCart();

    // State for Collapsible Sections
    const [sections, setSections] = useState({
        zebra: true,
        roller: true
    });

    // Product State
    const [zebraSwatches, setZebraSwatches] = useState([]);
    const [rollerSwatches, setRollerSwatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selected Color State for each Fabric: { [productId]: colorObject }
    const [selectedColors, setSelectedColors] = useState({});
    // Quantity State for each Fabric: { [productId]: quantity }
    const [quantities, setQuantities] = useState({});

    // Auto-expand/collapse sections based on sidebar selection
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
                // Fetch all products from Firestore
                const q = collection(db, "products");
                const querySnapshot = await getDocs(q);
                const allProducts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter products that belong to Zebra or Roller Shades
                const zebra = allProducts.filter(p => p.category === 'swatch-zebra');
                const roller = allProducts.filter(p => p.category === 'swatch-roller');


                setZebraSwatches(zebra);
                setRollerSwatches(roller);

                // Initialize default colors and quantities
                const initialColors = {};
                const initialQuantities = {};

                allProducts.forEach(prod => {
                    if (prod.colors && prod.colors.length > 0) {
                        // Find matching color from query params if coming from a specific product
                        let defaultColor = prod.colors[0];
                        if (fromProductName && prod.title?.toLowerCase() === fromProductName.toLowerCase()) {
                            // If a specific fabric is requested, make sure we auto-focus its section
                            if (prod.category?.toLowerCase().includes('zebra')) {
                                setSections({ zebra: true, roller: false });
                            } else if (prod.category?.toLowerCase().includes('roller')) {
                                setSections({ zebra: false, roller: true });
                            }
                        }
                        initialColors[prod.id] = defaultColor;
                    }
                    initialQuantities[prod.id] = 1;
                });

                setSelectedColors(prev => ({ ...initialColors, ...prev }));
                setQuantities(prev => ({ ...initialQuantities, ...prev }));

            } catch (error) {
                console.error("Error fetching swatches:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSwatches();
    }, [fromProductName]);

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Quantity Handlers
    const incrementQty = (productId) => {
        setQuantities(prev => ({ ...prev, [productId]: (prev[productId] || 1) + 1 }));
    };

    const decrementQty = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, (prev[productId] || 1) - 1)
        }));
    };

    // Color Change Handler
    const handleColorSelect = (productId, color) => {
        setSelectedColors(prev => ({ ...prev, [productId]: color }));
    };

    // Add Swatch to Cart
    const handleAddSwatchToCart = (product) => {
        const color = selectedColors[product.id];
        const qty = quantities[product.id] || 1;

        if (!color) {
            alert("Please select a color/fabric first!");
            return;
        }

        try {
            const swatchItem = {
                id: `swatch-${product.id}-${color.code || color.name}`,
                title: `[Swatch] ${product.title} (${color.name})`,
                category: 'swatch',
                imageUrl: color.image || product.imageUrl || product.image || 'https://via.placeholder.com/100',
                selectedColor: color.name,
                isStandalone: true
            };

            addToCart(swatchItem, { color }, 9.99, qty);
            alert(`[Swatch] ${product.title} (${color.name}) x ${qty} has been added to your cart!`);
        } catch (error) {
            console.error("Add Swatch Error:", error);
            alert("Failed to add swatch to cart.");
        }
    };

    // Category Sidebar Data matching Admin category values
    const swatchCategories = [
        { label: "All Swatches", key: null },
        { label: "Zebra Shade", key: "swatch-zebra" },
        { label: "Roller Shade", key: "swatch-roller" }
    ];

    // Swatch Catalog Grid Renderer
    const SwatchCatalogGrid = ({ products }) => {
        if (products.length === 0) {
            return (
                <div style={{ padding: '30px', color: '#888', fontStyle: 'italic', textAlign: 'center', background: '#fcfcfc', borderRadius: '12px', border: '1px dashed #eee' }}>
                    No fabric swatches available yet under this category.
                </div>
            );
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', padding: '15px 0' }}>
                {products.map(product => {
                    const activeColor = selectedColors[product.id] || (product.colors && product.colors[0]);
                    const currentQty = quantities[product.id] || 1;
                    const previewImage = activeColor?.image || product.imageUrl || product.image || 'https://via.placeholder.com/200';

                    // Check if this fabric was highlighted by user redirect
                    const isHighlighted = fromProductName && product.title?.toLowerCase() === fromProductName.toLowerCase();

                    return (
                        <div
                            key={product.id}
                            style={{
                                background: '#fff',
                                border: isHighlighted ? '2px solid var(--primary-green)' : '1px solid #eaeaea',
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: isHighlighted ? '0 8px 24px rgba(46, 125, 50, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = isHighlighted 
                                    ? '0 12px 28px rgba(46, 125, 50, 0.2)' 
                                    : '0 8px 20px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = isHighlighted 
                                    ? '0 8px 24px rgba(46, 125, 50, 0.15)' 
                                    : '0 4px 12px rgba(0,0,0,0.04)';
                            }}
                        >
                            {isHighlighted && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    left: '16px',
                                    background: 'var(--primary-green)',
                                    color: '#fff',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                }}>
                                    Requested Sample
                                </div>
                            )}

                            {/* Fabric Preview Image */}
                            <div style={{
                                height: '180px',
                                borderRadius: '8px',
                                background: `url(${previewImage}) center/cover`,
                                border: '1px solid #f0f0f0',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
                                    padding: '10px',
                                    color: '#fff',
                                    fontSize: '0.78rem',
                                    fontWeight: '500'
                                }}>
                                    {activeColor?.name || 'Main Preview'}
                                </div>
                            </div>

                            {/* Info */}
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: '700', color: '#1d1d1f' }}>
                                    {product.title}
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {product.category || 'Fabric'}
                                    </span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-green)' }}>
                                        $9.99
                                    </span>
                                </div>
                            </div>

                            {/* Color Selector Dots */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Select Color</span>
                                        <strong style={{ color: '#333' }}>{activeColor?.name}</strong>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {product.colors.map((color, idx) => {
                                            const isSelected = activeColor?.name === color.name;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleColorSelect(product.id, color)}
                                                    title={color.name}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: color.image ? `url(${color.image}) center/cover` : color.hex,
                                                        border: isSelected ? '2px solid #1d1d1f' : '1px solid #ddd',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: isSelected ? '0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,0.1)' : 'none',
                                                        transition: 'transform 0.15s ease'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    {isSelected && <Check size={12} color={color.hex === '#ffffff' ? '#000' : '#fff'} style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity & Action */}
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                                {/* Quantity Adjuster */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    height: '38px',
                                    padding: '0 4px'
                                }}>
                                    <button
                                        onClick={() => decrementQty(product.id)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '6px', color: '#666' }}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>
                                        {currentQty}
                                    </span>
                                    <button
                                        onClick={() => incrementQty(product.id)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '6px', color: '#666' }}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                {/* Add Button */}
                                <button
                                    onClick={() => handleAddSwatchToCart(product)}
                                    className="btn btn-primary"
                                    style={{
                                        flex: 1,
                                        height: '38px',
                                        padding: '0 16px',
                                        fontSize: '0.88rem',
                                        fontWeight: '700',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    Order Swatch
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="container" style={{ padding: '40px 20px', display: 'flex', minHeight: '80vh' }}>

            {/* 1. Sidebar with Fabric swatch categories */}
            <div style={{ marginRight: '40px', display: 'block' }}> {/* Visible on Desktop */}
                <SidebarFilter categories={swatchCategories} />
            </div>

            {/* 2. Main Swatch Catalog */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '30px', fontSize: '0.9rem', color: '#666' }}>
                    Collection / SWATCHES
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: '#1d1d1f' }}>
                    Order Sample Swatches
                </h1>
                <p style={{ color: '#666', marginBottom: fromProductName ? '20px' : '35px', fontSize: '1rem', lineHeight: '1.5' }}>
                    Experience the texture, color, and opacity of our premium fabrics at home. Each fabric sample swatch is flat-priced at <strong>$9.99</strong>. Feel the premium quality before purchasing!
                </p>

                {fromProductName && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#f0f7f4',
                        border: '1px solid var(--primary-green)',
                        borderRadius: '8px',
                        padding: '14px 18px',
                        marginBottom: '30px',
                        fontSize: '0.92rem',
                        color: '#1d1d1f'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>🎨</span>
                        <span>
                            You are looking for fabric samples from <strong>{fromProductName}</strong>. We've highlighted the matching collections below so you can easily order a sample.
                        </span>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary-green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        <div style={{ color: '#666', fontSize: '0.95rem' }}>Loading fabric swatches...</div>
                    </div>
                ) : (
                    <>
                        {/* Zebra Section */}
                        <div style={{ borderBottom: '1px solid #eee', marginBottom: '30px', paddingBottom: '15px' }}>
                            <div
                                onClick={() => toggleSection('zebra')}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '10px' }}
                            >
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1d1d1f', margin: 0 }}>Zebra Shade Fabric Swatches</h2>
                                {sections.zebra ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                            {sections.zebra && <SwatchCatalogGrid products={zebraSwatches} />}
                        </div>

                        {/* Roller Section */}
                        <div style={{ borderBottom: '1px solid #eee', marginBottom: '30px', paddingBottom: '15px' }}>
                            <div
                                onClick={() => toggleSection('roller')}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '10px' }}
                            >
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1d1d1f', margin: 0 }}>Roller Shade Fabric Swatches</h2>
                                {sections.roller ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                            {sections.roller && <SwatchCatalogGrid products={rollerSwatches} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Swatches;
