import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { Star, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, Check, AlertCircle, ChevronDown, ChevronUp, Loader2, Sparkles, ShieldCheck, Truck, ShieldAlert, Cpu, Rss, Sun, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderEngine } from '../lib/orderEngine';
import OrderingGuide from '../components/OrderingGuide';


const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fractions = [
        { value: '0', label: '0"' },
        { value: '0.0625', label: '1/16"' },
        { value: '0.125', label: '1/8"' },
        { value: '0.25', label: '1/4"' },
        { value: '0.375', label: '3/8"' },
        { value: '0.5', label: '1/2"' },
        { value: '0.625', label: '5/8"' },
        { value: '0.75', label: '3/4"' },
        { value: '0.875', label: '7/8"' },
    ];

    // -- State --
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeSection, setActiveSection] = useState('color');

    // Selection States
    const [selectedColor, setSelectedColor] = useState(null);
    const [width, setWidth] = useState('24');
    const [widthFraction, setWidthFraction] = useState('0');
    const [height, setHeight] = useState('36');
    const [heightFraction, setHeightFraction] = useState('0');
    const [mountType, setMountType] = useState('inside');
    const [motorType, setMotorType] = useState('standard');
    const [remoteType, setRemoteType] = useState('none');
    const [solarPanel, setSolarPanel] = useState(false);
    const [roomLabel, setRoomLabel] = useState('');
    const [selectedConfigs, setSelectedConfigs] = useState({}); // { groupID: optionID }
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [hoveredOption, setHoveredOption] = useState(null); // { name, image, price }

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProduct({ id: docSnap.id, ...data });
                    if (data.colors && data.colors.length > 0) {
                        setSelectedColor(data.colors[0]);
                    }

                    // Pre-calculate images array for effects
                    const prodImages = data.images && data.images.length > 0 
                        ? data.images 
                        : data.imageUrl 
                            ? [data.imageUrl] 
                            : ["https://via.placeholder.com/600x600/f5f5f5/333?text=No+Image"];
                    
                    if (!mainImageUrl && prodImages.length > 0) {
                        setMainImageUrl(prodImages[0]);
                    }
                    // Initialize custom configs
                    if (data.configGroups) {
                        const initialConfigs = {};
                        data.configGroups.forEach(group => {
                            if (group.options && group.options.length > 0) {
                                initialConfigs[group.id] = group.options[0].id;
                            }
                        });
                        setSelectedConfigs(initialConfigs);
                    }
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const images = product?.images && product.images.length > 0 
        ? product.images 
        : product?.imageUrl 
            ? [product.imageUrl] 
            : ["https://via.placeholder.com/600x600/f5f5f5/333?text=No+Image"];

    // Handle Image Switching logic
    useEffect(() => {
        if (product && images && images.length > 0) {
            setMainImageUrl(images[currentImageIndex]);
        }
    }, [currentImageIndex, product, images]);

    useEffect(() => {
        if (selectedColor?.fullImage) {
            setMainImageUrl(selectedColor.fullImage);
        }
    }, [selectedColor]);

    const [validationError, setValidationError] = useState('');

    // -- Helpers --
    // -- Detailed Explanations for each step (SelectBlinds style) --
    const EXPLANATIONS = {
        color: "Choose from our premium fabric collections. Light-filtering fabrics diffuse sunlight gently, while blackout fabrics provide complete privacy and room darkening.",
        mount: "Inside Mount: Fits within the window frame for a custom, built-in look. Requires at least 2\" of depth. Outside Mount: Fits on the wall or trim, offering maximum light blocking and covering the entire window opening.",
        size: "Measurements are in inches. Always measure to the nearest 1/8\". For Inside Mount, we recommend measuring the width at the top, middle, and bottom, then providing the SMALLEST width.",
        motor: "Standard RF: Simple remote control. Zigbee 3.0: Requires a hub for smart home control. Alexa Direct: Connects directly to Echo devices with built-in hubs. Matter: The latest industry standard for cross-platform smart home compatibility.",
        remote: "1-Channel remotes control a single shade or a group together. 5 and 15-Channel remotes allow you to assign shades to different channels for individual or group control.",
        addons: "The Solar Panel Charger uses natural light to keep your motor battery topped up, reducing the need for manual charging via USB cable.",
        room: "Labeling your shades by room (e.g., 'Master Bedroom') helps us organize your order and makes installation much easier once they arrive."
    };

    const calculatePrice = () => {
        if (!product) return 0;

        const w = parseFloat(width || 0) + parseFloat(widthFraction);
        const h = parseFloat(height || 0) + parseFloat(heightFraction);
        
        if (w <= 0 || h <= 0) return (product.basePrice || 0).toFixed(2);

        // Standard options (Legacy support or fixed defaults)
        let motorPrice = 0;
        if (motorOption === 'ble_motor') motorPrice = 148;
        if (motorOption === 'zigbee_motor') motorPrice = 155;
        
        let remotePrice = 0;
        if (remoteOption === 'basic_remote') remotePrice = 19;

        // Custom Dynamic configurations
        let customPrice = 0;
        if (product.configGroups) {
            product.configGroups.forEach(group => {
                const selectedId = selectedConfigs[group.id];
                const option = group.options.find(o => o.id === selectedId);
                if (option) customPrice += Number(option.price || 0);
            });
        }

        const result = orderEngine.calculateOrder({
            widthInch: w,
            heightInch: h,
            mountType: mountType,
            motorType: motorType,
            remoteType: remoteType,
            solarPanel: solarPanel
        });

        const baseCalculatedPrice = result?.["Total Price"] || 0;
        return (Number(baseCalculatedPrice) + customPrice).toFixed(2);
    };


    const handleAddToCart = () => {
        try {
            // Validation
            const w = parseFloat(width || 0) + parseFloat(widthFraction);
            const h = parseFloat(height || 0) + parseFloat(heightFraction);

            if (!width || !height || w === 0 || h === 0) {
                setValidationError('Please enter valid measurements.');
                setActiveSection('size');
                return;
            }
            if (w < product.minWidth || w > product.maxWidth) {
                setValidationError(`Width must be between ${product.minWidth}" and ${product.maxWidth}".`);
                setActiveSection('size');
                return;
            }
            if (h < product.minHeight || h > product.maxHeight) {
                setValidationError(`Height must be between ${product.minHeight}" and ${product.maxHeight}".`);
                setActiveSection('size');
                return;
            }

            setValidationError('');

            const JSBlindData = orderEngine.calculateOrder({
                name: currentUser?.displayName || "Customer",
                location: roomLabel,
                widthInch: w,
                heightInch: h,
                fabricCode: selectedColor?.component_id || selectedColor?.code || selectedColor?.name || "",
                mountType: mountType,
                motorType: motorType,
                remoteType: remoteType,
                solarPanel: solarPanel
            });

            // Resolve custom config details for cart display
            const customConfigDetails = {};
            if (product.configGroups) {
                product.configGroups.forEach(group => {
                    const selectedId = selectedConfigs[group.id];
                    const option = group.options.find(o => o.id === selectedId);
                    if (option) {
                        customConfigDetails[group.name] = option.name;
                    }
                });
            }

            const finalItem = {
                ...product, // basic info
                id: product.id,
                title: product.title,
                selectedColor: selectedColor?.name || "Default",
                width: w,
                height: h,
                mount: mountType,
                control: motorOption,
                remote: remoteOption,
                room: roomLabel,
                price: parseFloat(calculatePrice()),
                quantity: 1,
                JSBlindData,
                customConfigs: customConfigDetails,
                options: {
                    color: selectedColor,
                    measurements: { width: w, height: h },
                    mount: mountType,
                    motor: motorOption,
                    remote: remoteOption,
                    room: roomLabel,
                    customSelections: customConfigDetails
                }
            };

            console.log("Adding to cart:", finalItem);
            addToCart(finalItem, finalItem.options, finalItem.price, 1);
            alert('Product added to cart!');
        } catch (err) {
            console.error("Cart Error:", err);
            alert("Error adding to cart: " + err.message);
        }
    };

    const handleFavorite = async () => {
        if (!currentUser) {
            alert("Please login to save favorites.");
            navigate('/login');
            return;
        }

        try {
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, {
                favorites: arrayUnion({
                    id: id,
                    title: product.title,
                    price: product.basePrice || 0,
                    image: product.imageUrl || (product.colors && product.colors[0]?.image) || ""
                })
            }, { merge: true });
            
            alert("Added to Favorites!");
        } catch (error) {
            console.error("Error adding favorite:", error);
            alert("Failed to add to favorites: " + error.message);
        }
    };
    if (loading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary-green)' }} />
                <p style={{ marginTop: '20px', color: '#666' }}>Loading product details...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <h2>{error || "Product not found"}</h2>
                <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '20px' }}>Back to Products</button>
            </div>
        );
    }


    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>

                {/* Left: Image Gallery (Sticky) */}
                <div style={{ flex: '1 1 500px', position: 'sticky', top: '100px', alignSelf: 'start' }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1/1',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '20px'
                    }}>
                        <img
                            src={mainImageUrl || images[currentImageIndex]}
                            alt={product.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.4s ease' }}
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800";
                            }}
                        />
                        {/* Nav Arrows */}
                        <button
                            onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`Thumbnail ${idx}`}
                                onClick={() => setCurrentImageIndex(idx)}
                                style={{
                                    width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer',
                                    border: currentImageIndex === idx ? '2px solid #333' : '1px solid #ddd'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "https://images.unsplash.com/photo-1513694203530-ad3d99967451?auto=format&fit=crop&q=80&w=800";
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Configuration Panel */}
                <div style={{ flex: '1 1 400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px' }}>{product.title}</h1>
                        <button 
                            onClick={() => setIsGuideOpen(true)}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: '#f0f9ff', 
                                color: '#0369a1', 
                                border: '1px solid #bae6fd', 
                                padding: '6px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.8rem', 
                                fontWeight: '600',
                                cursor: 'pointer' 
                            }}
                        >
                            <Info size={14} /> Buying Guide
                        </button>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary-olive)', marginBottom: '15px' }}>
                        ${calculatePrice()} <span style={{ fontSize: '1rem', color: '#666', fontWeight: '400' }}>USD</span>
                    </div>

                    {/* Trust Banners (Benchmarked from Graywind) */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'var(--bg-soft)', color: 'var(--primary-green)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid var(--border-color)' }}>
                            <Truck size={14} /> Free Shipping within US
                        </div>
                        <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #dcfce7' }}>
                            <ShieldCheck size={14} /> No-Return Replacement
                        </div>
                        <div style={{ background: '#fff7ed', color: '#ea580c', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #ffedd5' }}>
                            <Sparkles size={14} /> JSBlind™ Factory Direct
                        </div>
                    </div>

                    {/* Option List Style UI */}
                    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>

                        {/* 1. Colors */}
                        {(product.showColor !== false) && (
                            <OptionSection
                                title={`Color: ${selectedColor?.name || 'Select Color'}`}
                                isOpen={activeSection === 'color'}
                                onToggle={() => setActiveSection(activeSection === 'color' ? '' : 'color')}
                                helpText={EXPLANATIONS.color}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                    {product.colors && product.colors.map((c, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedColor(c)}
                                            style={{
                                                cursor: 'pointer',
                                                border: selectedColor === c ? '2px solid #333' : '1px solid #eee',
                                                borderRadius: '6px',
                                                padding: '4px',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ height: '60px', background: c.image ? `url(${c.image}) center/cover` : c.hex, borderRadius: '4px' }}></div>
                                            <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{c.name}</div>
                                            {selectedColor === c && <div style={{ position: 'absolute', top: '5px', right: '5px', background: '#333', color: '#fff', borderRadius: '50%', padding: '2px' }}><Check size={12} /></div>}
                                        </div>
                                    ))}
                                </div>
                            </OptionSection>
                        )}

                        {/* Dynamic Custom Configurations */}
                        {product.configGroups && product.configGroups.map((group) => (
                            <OptionSection
                                key={group.id}
                                title={`${group.name}: ${group.options.find(o => o.id === selectedConfigs[group.id])?.name || 'Select'}`}
                                isOpen={activeSection === group.id}
                                onToggle={() => setActiveSection(activeSection === group.id ? '' : group.id)}
                            >
                                {group.type === 'select' ? (
                                    <select 
                                        value={selectedConfigs[group.id]} 
                                        onChange={(e) => setSelectedConfigs(prev => ({...prev, [group.id]: e.target.value}))}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        {group.options.map(o => (
                                            <option key={o.id} value={o.id}>{o.name} {o.price > 0 ? `(+$${o.price})` : ''}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                        {group.options.map(opt => (
                                            <div
                                                key={opt.id}
                                                onClick={() => setSelectedConfigs(prev => ({...prev, [group.id]: opt.id}))}
                                                style={{
                                                    border: selectedConfigs[group.id] === opt.id ? '2px solid #333' : '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    padding: '12px',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    background: selectedConfigs[group.id] === opt.id ? '#fcfcfc' : '#fff'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{opt.name}</div>
                                                {opt.desc && <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>{opt.desc}</div>}
                                                <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '10px' }}>
                                                    {opt.price > 0 ? `+$${opt.price.toFixed(2)}` : 'Included'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </OptionSection>
                        ))}

                        {/* 2. Cassette */}
                        <OptionSection
                            title="Cassette & Bottom bar Style"
                            isOpen={activeSection === 'cassette'}
                            onToggle={() => setActiveSection(activeSection === 'cassette' ? '' : 'cassette')}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                {['White [MX01]', 'Gray [MX02]', 'Coffee [MX03]', 'Black [MX04]'].map((opt) => (
                                    <div
                                        key={opt}
                                        onMouseEnter={() => setHoveredOption({ name: opt, image: `/images/details/cassette_${opt.split(' ')[0].toLowerCase()}.png`, price: 0 })}
                                        onMouseLeave={() => setHoveredOption(null)}
                                        onClick={() => console.log('Cassette selected:', opt)} // Placeholder logic
                                        style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '10px', textAlign: 'center', cursor: 'pointer' }}
                                    >
                                        <div style={{ height: '50px', background: '#eee', marginBottom: '5px', borderRadius: '4px' }}></div> {/* Placeholder Image */}
                                        <div style={{ fontSize: '0.8rem' }}>{opt}</div>
                                    </div>
                                ))}
                            </div>
                        </OptionSection>

                        {/* 3. Mount Type */}
                        <OptionSection
                            title={`Mount Type: ${mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}`}
                            isOpen={activeSection === 'mount'}
                            onToggle={() => setActiveSection(activeSection === 'mount' ? '' : 'mount')}
                            helpText={EXPLANATIONS.mount}
                        >
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div
                                    onClick={() => setMountType('inside')}
                                    style={{ flex: 1, border: mountType === 'inside' ? '2px solid #333' : '1px solid #ddd', borderRadius: '6px', padding: '15px', cursor: 'pointer', textAlign: 'center', position: 'relative', background: mountType === 'inside' ? '#fcfcfc' : '#fff' }}
                                >
                                    <div style={{ height: '80px', background: '#f5f5f5', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                        <svg width="60" height="60" viewBox="0 0 100 100">
                                            <rect x="10" y="10" width="80" height="80" fill="none" stroke="#ccc" strokeWidth="2" />
                                            <rect x="15" y="15" width="70" height="15" fill="#333" opacity="0.8" />
                                            <rect x="15" y="30" width="70" height="50" fill="#eee" />
                                        </svg>
                                    </div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Inside Mount</div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>Clean, integrated look. Fits inside the window frame.</div>
                                    {mountType === 'inside' && <Check size={16} style={{ position: 'absolute', top: '10px', right: '10px', color: '#333' }} />}
                                </div>
                                <div
                                    onClick={() => setMountType('outside')}
                                    style={{ flex: 1, border: mountType === 'outside' ? '2px solid #333' : '1px solid #ddd', borderRadius: '6px', padding: '15px', cursor: 'pointer', textAlign: 'center', position: 'relative', background: mountType === 'outside' ? '#fcfcfc' : '#fff' }}
                                >
                                    <div style={{ height: '80px', background: '#f5f5f5', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                        <svg width="60" height="60" viewBox="0 0 100 100">
                                            <rect x="25" y="25" width="50" height="50" fill="none" stroke="#ccc" strokeWidth="2" />
                                            <rect x="15" y="15" width="70" height="15" fill="#333" opacity="0.8" />
                                            <rect x="15" y="30" width="70" height="60" fill="#eee" />
                                        </svg>
                                    </div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Outside Mount</div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>Better light blocking. Mounts on wall/trim.</div>
                                    {mountType === 'outside' && <Check size={16} style={{ position: 'absolute', top: '10px', right: '10px', color: '#333' }} />}
                                </div>
                            </div>
                        </OptionSection>

                        {/* 4. Measurements */}
                        <OptionSection
                            title="Measurements"
                            isOpen={activeSection === 'size'}
                            onToggle={() => setActiveSection(activeSection === 'size' ? '' : 'size')}
                            helpText={EXPLANATIONS.size}
                        >
                            <div style={{ marginBottom: '15px' }}>
                                <Link to="/support" style={{ fontSize: '0.85rem', color: 'var(--primary-green)', textDecoration: 'underline' }}>
                                    How to measure your windows?
                                </Link>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>WIDTH (INCH)</label>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <select 
                                            value={width} 
                                            onChange={(e) => setWidth(e.target.value)}
                                            style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        >
                                            {Array.from({length: 96}, (_, i) => i + 15).map(v => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </select>
                                        <select 
                                            value={widthFraction} 
                                            onChange={(e) => setWidthFraction(e.target.value)}
                                            style={{ width: '80px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        >
                                            {fractions.map(f => <option key={f.value} value={f.value}>{f.label.replace('"', '')}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>HEIGHT (INCH)</label>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <select 
                                            value={height} 
                                            onChange={(e) => setHeight(e.target.value)}
                                            style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        >
                                            {Array.from({length: 106}, (_, i) => i + 15).map(v => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </select>
                                        <select 
                                            value={heightFraction} 
                                            onChange={(e) => setHeightFraction(e.target.value)}
                                            style={{ width: '80px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        >
                                            {fractions.map(f => <option key={f.value} value={f.value}>{f.label.replace('"', '')}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {validationError && (
                                <div style={{ marginTop: '10px', padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} />
                                    {validationError}
                                </div>
                            )}
                        </OptionSection>


                        {/* 5. Motorization */}
                        <OptionSection
                            title="Motor Type"
                            isOpen={activeSection === 'motor'}
                            onToggle={() => setActiveSection(activeSection === 'motor' ? '' : 'motor')}
                            helpText={EXPLANATIONS.motor}
                        >
                                {[
                                    { id: 'standard', name: 'Standard RF', icon: <Cpu size={20} />, desc: 'Remote controlled', price: 0, previewImage: '/images/details/standard_motor.png' },
                                    { id: 'zigbee', name: 'Zigbee 3.0', icon: <Rss size={20} />, desc: 'Hub required', price: 25, previewImage: '/images/details/zigbee_motor.png' },
                                    { id: 'alexa', name: 'Alexa Direct', icon: <Sparkles size={20} />, desc: 'No hub needed', price: 29, previewImage: '/images/details/alexa_motor.png' },
                                    { id: 'matter', name: 'Matter / Thread', icon: <ShieldCheck size={20} />, desc: 'Future-proof', price: 94, previewImage: '/images/details/matter_motor.png' }
                                ].map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => setMotorType(m.id)}
                                        onMouseEnter={() => setHoveredOption({ name: m.name, image: m.previewImage, price: m.price })}
                                        onMouseLeave={() => setHoveredOption(null)}
                                        style={{
                                            border: motorType === m.id ? '2px solid #333' : '1px solid #ddd',
                                            borderRadius: '8px', padding: '15px', cursor: 'pointer', textAlign: 'center',
                                            background: motorType === m.id ? '#fcfcfc' : '#fff', position: 'relative'
                                        }}
                                    >
                                        <div style={{ color: motorType === m.id ? 'var(--primary-green)' : '#666', marginBottom: '8px' }}>{m.icon}</div>
                                        <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{m.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>{m.desc}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '800', marginTop: '10px' }}>+${m.price}</div>
                                        {motorType === m.id && <Check size={14} style={{ position: 'absolute', top: '8px', right: '8px' }} />}
                                    </div>
                                ))}
                            </div>
                        </OptionSection>

                        {/* 6. Remote Control */}
                        <OptionSection
                            title="Remote Control"
                            isOpen={activeSection === 'remote'}
                            onToggle={() => setActiveSection(activeSection === 'remote' ? '' : 'remote')}
                            helpText={EXPLANATIONS.remote}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                {[
                                    { id: 'none', name: 'No Remote', price: 0 },
                                    { id: '1-channel', name: '1-Channel', price: 25 },
                                    { id: '5-channel', name: '5-Channel', price: 35 },
                                    { id: '15-channel', name: '15-Channel', price: 45 }
                                ].map(r => (
                                    <div
                                        key={r.id}
                                        onClick={() => setRemoteType(r.id)}
                                        style={{
                                            border: remoteType === r.id ? '2px solid #333' : '1px solid #ddd',
                                            borderRadius: '6px', padding: '12px', cursor: 'pointer', textAlign: 'center',
                                            background: remoteType === r.id ? '#fcfcfc' : '#fff'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{r.name}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '5px' }}>+${r.price}</div>
                                    </div>
                                ))}
                            </div>
                        </OptionSection>

                        {/* 7. Add-ons */}
                        <OptionSection
                            title="Upgrades & Add-ons"
                            isOpen={activeSection === 'addons'}
                            onToggle={() => setActiveSection(activeSection === 'addons' ? '' : 'addons')}
                            helpText={EXPLANATIONS.addons}
                        >
                            <div 
                                onClick={() => setSolarPanel(!solarPanel)}
                                style={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                    padding: '15px', border: solarPanel ? '2px solid #333' : '1px solid #eee', 
                                    borderRadius: '8px', cursor: 'pointer', background: solarPanel ? '#fcfcfc' : '#fff'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#fff9c4', color: '#fbc02d', padding: '8px', borderRadius: '50%' }}><Sun size={20} /></div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Solar Panel Charger</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>Eco-friendly continuous charging</div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: '800' }}>+$49.00</div>
                            </div>
                        </OptionSection>

                        {/* 8. Final Details */}
                        <OptionSection
                            title="Room Label"
                            isOpen={activeSection === 'room'}
                            onToggle={() => setActiveSection(activeSection === 'room' ? '' : 'room')}
                            helpText={EXPLANATIONS.room}
                        >
                            <input
                                type="text"
                                value={roomLabel}
                                onChange={(e) => setRoomLabel(e.target.value)}
                                placeholder="e.g. Master Bedroom"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </OptionSection>

                    </div>

                        <div style={{ marginTop: '40px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Estimated Total</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1d1d1f' }}>${calculatePrice()}</div>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="btn btn-primary"
                                style={{ flex: 2, padding: '20px', fontSize: '1.1rem', borderRadius: '8px' }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                padding: '15px 20px',
                boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 999,
                borderTop: '1px solid #eee'
            }} className="mobile-only">
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>Total Price</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>${calculatePrice()}</div>
                </div>
                <button 
                    onClick={handleAddToCart}
                    style={{ background: '#333', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: '700' }}
                >
                    Add to Cart
                </button>
            </div>

            <OrderingGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

            {/* Floating Quick View (Enlarge on Hover) */}
            {hoveredOption && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '450px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    zIndex: 10000,
                    overflow: 'hidden',
                    border: '1px solid #eee',
                    pointerEvents: 'none', // Prevents jitter
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{ padding: '12px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{hoveredOption.name}</div>
                        <div style={{ color: 'var(--primary-green)', fontWeight: '800' }}>+${hoveredOption.price}</div>
                    </div>
                    <div style={{ width: '100%', aspectRatio: '1/1', background: '#fff' }}>
                        <img 
                            src={hoveredOption.image} 
                            alt={hoveredOption.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                // Fallback to a nice generic detail if image missing
                                e.target.src = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800";
                            }}
                        />
                    </div>
                    <div style={{ padding: '15px', fontSize: '0.85rem', color: '#666', background: '#fcfcfc', textAlign: 'center' }}>
                        Professional Detail View - Hover to inspect specifications
                    </div>
                </div>
            )}
            
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translate(-50%, -45%); }
                        to { opacity: 1; transform: translate(-50%, -50%); }
                    }
                `}
            </style>
        </div>
    );
};

// Start of Helper Components
const OptionSection = ({ title, isOpen, onToggle, helpText, children }) => {
    const [showHelp, setShowHelp] = useState(false);
    
    return (
        <div style={{ borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: isOpen ? '#f9f9f9' : '#fff' }}>
                <button
                    onClick={onToggle}
                    style={{
                        flex: 1, padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', fontWeight: '600'
                    }}
                >
                    {title}
                    {isOpen ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                </button>
                {helpText && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowHelp(!showHelp);
                        }}
                        style={{ padding: '0 15px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#0369a1' }}
                    >
                        <Info size={18} />
                    </button>
                )}
            </div>
            {showHelp && helpText && (
                <div style={{ padding: '12px 15px', background: '#f0f9ff', color: '#0c4a6e', fontSize: '0.85rem', borderTop: '1px solid #e0f2fe', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Sparkles size={14} /> Tip & Detail:
                    </div>
                    {helpText}
                </div>
            )}
            {isOpen && <div style={{ padding: '15px' }}>{children}</div>}
        </div>
    );
};

export default ProductDetail;
