import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { Star, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, Check, AlertCircle, ChevronDown, ChevronUp, Loader2, Sparkles, ShieldCheck, Truck, ShieldAlert, Cpu, Rss, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderEngine } from '../lib/orderEngine';


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
    const [width, setWidth] = useState('');
    const [widthFraction, setWidthFraction] = useState('0');
    const [height, setHeight] = useState('');
    const [heightFraction, setHeightFraction] = useState('0');
    const [mountType, setMountType] = useState('inside');
    const [motorOption, setMotorOption] = useState('manual');
    const [remoteOption, setRemoteOption] = useState('none');
    const [roomLabel, setRoomLabel] = useState('');
    const [selectedConfigs, setSelectedConfigs] = useState({}); // { groupID: optionID }

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

    const [validationError, setValidationError] = useState('');

    // -- Helpers --
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
            motorPrice: motorPrice // This stays for the core engine logic
        });

        // Add custom price and remote price to the total
        return (result["Total Price"] + remotePrice + customPrice).toFixed(2);
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

            const motorPrice = motorOption === 'ble_motor' ? 148 : (motorOption === 'zigbee_motor' ? 155 : 0);
            const JSBlindData = orderEngine.calculateOrder({
                name: currentUser?.displayName || "Customer",
                location: roomLabel,
                widthInch: w,
                heightInch: h,
                fabricCode: selectedColor?.component_id || selectedColor?.code || selectedColor?.name || "",
                mountType: mountType,
                motorPrice: motorPrice
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

    const images = product.images && product.images.length > 0 ? product.images : ["https://via.placeholder.com/600x600/f5f5f5/333?text=No+Image"];

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
                            src={images[currentImageIndex]}
                            alt={product.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Configuration Panel */}
                <div style={{ flex: '1 1 400px' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px' }}>{product.title}</h1>
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
                                {/* Mock Cassette Options */}
                                {['White [MX01]', 'Gray [MX02]', 'Coffee [MX03]', 'Black [MX04]'].map((opt) => (
                                    <div
                                        key={opt}
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
                        >
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div
                                    onClick={() => setMountType('inside')}
                                    style={{ flex: 1, border: mountType === 'inside' ? '2px solid #333' : '1px solid #ddd', borderRadius: '6px', padding: '15px', cursor: 'pointer', textAlign: 'center', position: 'relative', background: mountType === 'inside' ? '#fcfcfc' : '#fff' }}
                                >
                                    <div style={{ height: '80px', background: '#f5f5f5', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                        {/* Simple SVG Diagram */}
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
                        >
                            <div style={{ marginBottom: '15px' }}>
                                <Link to="/support" style={{ fontSize: '0.85rem', color: 'var(--primary-green)', textDecoration: 'underline' }}>
                                    How to measure your windows?
                                </Link>
                            </div>
                            {/* Width Row */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Custom Width *</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => setWidth(e.target.value)}
                                        placeholder="Inch"
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Width Fraction *</label>
                                    <select
                                        value={widthFraction}
                                        onChange={(e) => setWidthFraction(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        {fractions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Height Row */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Custom Height *</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder="Inch"
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Height Fraction *</label>
                                    <select
                                        value={heightFraction}
                                        onChange={(e) => setHeightFraction(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        {fractions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Reconfirmation */}
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Reconfirmation</label>
                                <div style={{ padding: '10px', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px', color: '#555', fontSize: '0.9rem' }}>
                                    {width ? `${width} ${fractions.find(f => f.value === widthFraction)?.label.replace('0"', '')}` : '-'} W x {height ? `${height} ${fractions.find(f => f.value === heightFraction)?.label.replace('0"', '')}` : '-'} H
                                </div>
                            </div>

                            {validationError && (
                                <div style={{ marginTop: '10px', padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} />
                                    {validationError}
                                </div>
                            )}
                        </OptionSection>


                        {/* 5. Motor / Control */}
                        {(product.showMotor !== false) && (
                            <>
                                <OptionSection
                                    title="Choose your motor"
                                    isOpen={activeSection === 'motor'}
                                    onToggle={() => setActiveSection(activeSection === 'motor' ? '' : 'motor')}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                        {/* Manual */}
                                        <div
                                            onClick={() => setMotorOption('manual')}
                                            style={{
                                                border: motorOption === 'manual' ? '2px solid #333' : '1px solid #ddd',
                                                borderRadius: '6px',
                                                padding: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                background: motorOption === 'manual' ? '#fcfcfc' : '#fff'
                                            }}
                                        >
                                            <div style={{ width: '32px', height: '32px', background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                                <ChevronDown size={18} />
                                            </div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Manual</div>
                                            <div style={{ fontSize: '0.7rem', color: '#888' }}>Standard Chain</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '10px' }}>+$0.00</div>
                                        </div>

                                        {/* BLE Motor */}
                                        <div
                                            onClick={() => setMotorOption('ble_motor')}
                                            style={{
                                                border: motorOption === 'ble_motor' ? '2px solid #333' : '1px solid #ddd',
                                                borderRadius: '6px',
                                                padding: '12px',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                textAlign: 'center',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                background: motorOption === 'ble_motor' ? '#fcfcfc' : '#fff'
                                            }}
                                        >
                                            <div style={{ width: '32px', height: '32px', background: 'var(--bg-soft)', color: 'var(--primary-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                                <Rss size={16} />
                                            </div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>BLE Smart</div>
                                            <div style={{ fontSize: '0.7rem', color: '#888' }}>Bluetooth 5.0</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '10px' }}>+$135.00</div>
                                        </div>

                                        {/* Zigbee Motor */}
                                        <div
                                            onClick={() => setMotorOption('zigbee_motor')}
                                            style={{
                                                border: motorOption === 'zigbee_motor' ? '2px solid #333' : '1px solid #ddd',
                                                borderRadius: '6px',
                                                padding: '12px',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                textAlign: 'center',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                background: motorOption === 'zigbee_motor' ? '#fcfcfc' : '#fff'
                                            }}
                                        >
                                            <div style={{ width: '32px', height: '32px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                                <Cpu size={16} />
                                            </div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Matter/Zigbee</div>
                                            <div style={{ fontSize: '0.7rem', color: '#888' }}>Universal Hub</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '10px' }}>+$155.00</div>
                                        </div>
                                    </div>

                                    {/* Smart Home Compatibility Info (Allesin style) */}
                                    <div style={{ marginTop: '15px', padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Check size={14} color="#16a34a" /> Works with:
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px', color: '#888', flexWrap: 'wrap' }}>
                                            <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Rss size={12} /> Alexa</div>
                                            <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Rss size={12} /> Google Home</div>
                                            <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Cpu size={12} /> Apple Home</div>
                                            <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Sun size={12} /> Solar Ready</div>
                                        </div>
                                    </div>
                                </OptionSection>

                                {/* 6. Remote (Only if motor is selected) */}
                                {motorOption !== 'manual' && (
                                    <OptionSection
                                        title="Remote Controller"
                                        isOpen={activeSection === 'remote'}
                                        onToggle={() => setActiveSection(activeSection === 'remote' ? '' : 'remote')}
                                    >
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                            {/* None */}
                                            <div
                                                onClick={() => setRemoteOption('none')}
                                                style={{
                                                    border: remoteOption === 'none' ? '2px solid #333' : '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    padding: '10px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px', padding: '20px 0' }}>NONE</div>
                                                <div style={{ fontSize: '0.8rem' }}>No Remote</div>
                                            </div>
                                            {/* Basic Remote */}
                                            <div
                                                onClick={() => setRemoteOption('basic_remote')}
                                                style={{
                                                    border: remoteOption === 'basic_remote' ? '2px solid #333' : '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    padding: '10px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.8rem', fontWeight: '500', marginBottom: '4px' }}>16-Channel [ZB16]</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>+$19.00</div>
                                            </div>
                                        </div>
                                    </OptionSection>
                                )}
                            </>
                        )}

                        {/* 7. Extra Options (Room Label) */}
                        <OptionSection
                            title="Room Label"
                            isOpen={activeSection === 'room'}
                            onToggle={() => setActiveSection(activeSection === 'room' ? '' : 'room')}
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

                    {/* Action Bar */}
                    <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                        <button
                            className="btn btn-secondary"
                            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onClick={handleFavorite}
                        >
                            <Heart size={20} /> Favorite
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '15px', fontSize: '1.1rem' }}
                            onClick={handleAddToCart}
                        >
                            Add to Cart - ${calculatePrice()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Start of Helper Components
const OptionSection = ({ title, isOpen, onToggle, children }) => (
    <div style={{ borderBottom: '1px solid #eee' }}>
        <button
            onClick={onToggle}
            style={{
                width: '100%', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: isOpen ? '#f9f9f9' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', fontWeight: '600'
            }}
        >
            {title}
            {isOpen ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
        </button>
        {isOpen && <div style={{ padding: '15px' }}>{children}</div>}
    </div>
);

export default ProductDetail;
