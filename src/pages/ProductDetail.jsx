import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { Star, MessageCircle, Heart, Share2, ChevronLeft, ChevronRight, Check, AlertCircle, ChevronDown, ChevronUp, Loader2, Sparkles, ShieldCheck, Truck, ShieldAlert, Cpu, Rss, Sun, Info, X, Ruler } from 'lucide-react';
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
    const [width, setWidth] = useState('');
    const [widthFraction, setWidthFraction] = useState('0');
    const [height, setHeight] = useState('');
    const [heightFraction, setHeightFraction] = useState('0');
    const [mountType, setMountType] = useState('');
    const [motorType, setMotorType] = useState('');
    const [remoteType, setRemoteType] = useState('');
    const [solarPanel, setSolarPanel] = useState(false);
    const [bondBridge, setBondBridge] = useState(false);
    const [roomLabel, setRoomLabel] = useState('');
    const [roomType, setRoomType] = useState('');
    const [roomDetail, setRoomDetail] = useState('');
    const [controlSide, setControlSide] = useState('');
    const [selectedConfigs, setSelectedConfigs] = useState({}); // { groupID: optionID }
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
    const [fitProtection, setFitProtection] = useState(false);
    const [rememberOptions, setRememberOptions] = useState(false);
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
                        // Don't auto-select color unless the user wants to
                        // setSelectedColor(data.colors[0]); 
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

        // Load remembered options
        const saved = localStorage.getItem('jsblind_remembered_options');
        if (saved) {
            try {
                const options = JSON.parse(saved);
                if (options.mountType) setMountType(options.mountType);
                if (options.motorType) setMotorType(options.motorType);
                if (options.remoteType) setRemoteType(options.remoteType);
                if (options.controlSide) setControlSide(options.controlSide);
                if (options.roomType) setRoomType(options.roomType);
                setRememberOptions(true);
            } catch (e) {
                console.error("Failed to load saved options", e);
            }
        }
    }, [id]);

    // Save options when they change
    useEffect(() => {
        if (rememberOptions) {
            const toSave = {
                mountType,
                motorType,
                remoteType,
                controlSide,
                roomType
            };
            localStorage.setItem('jsblind_remembered_options', JSON.stringify(toSave));
        } else {
            // Option: keep or clear? Usually clear if user unchecks
            // localStorage.removeItem('jsblind_remembered_options');
        }
    }, [rememberOptions, mountType, motorType, remoteType, controlSide, roomType]);

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
        remote: "Select a remote to control your shades. Our 5 and 15-channel remotes can operate multiple shades simultaneously. The Bond Bridge Hub adds Wi-Fi control via smartphone and integrates with Alexa, Google Home, and SmartThings.",
        addons: "The Solar Panel Charger uses natural light to keep your motor battery topped up, reducing the need for manual charging via USB cable.",
        room: "Labeling your shades by room (e.g., 'Master Bedroom') helps us organize your order and makes installation much easier once they arrive. You can pick a room name and add a specific detail like 'Left Window'."
    };

    const calculatePrice = () => {
        if (!product) return "0.00";

        const w = parseFloat(width || 0) + parseFloat(widthFraction);
        const h = parseFloat(height || 0) + parseFloat(heightFraction);
        
        if (w <= 0 || h <= 0) return (product.basePrice || 0).toFixed(2);

        // 1. Calculate Base Price via Engine
        const result = orderEngine.calculateOrder({
            widthInch: w,
            heightInch: h,
            mountType: mountType,
            motorType: motorType,
            remoteType: remoteType,
            solarPanel: solarPanel,
            hub: bondBridge
        });

        let totalPrice = result?.["Total Price"] || 0;
        console.log("Price Debug:", { motorType, remoteType, resultPrice: result?.["Total Price"], totalPrice });

        // 2. Add custom configs prices if not handled by engine
        if (product.configGroups) {
            product.configGroups.forEach(group => {
                const selectedId = selectedConfigs[group.id];
                const option = group.options.find(o => o.id === selectedId);
                if (option) totalPrice += Number(option.price || 0);
            });
        }
        
        return totalPrice.toFixed(2);
    };


    const handleAddToCart = () => {
        try {
            // Validation
            const w = parseFloat(width || 0) + parseFloat(widthFraction);
            const h = parseFloat(height || 0) + parseFloat(heightFraction);

            // Mandatory Field Checks
            if (!selectedColor) {
                setValidationError('Please select a color.');
                setActiveSection('color');
                return;
            }
            if (!w || !h || w === 0 || h === 0) {
                setValidationError('Please enter valid measurements.');
                setActiveSection('size');
                return;
            }
            if (motorType === 'motorized' && remoteType === 'none' && !bondBridge) {
                setValidationError('Please select a remote or smart hub for motorized shades.');
                setActiveSection('remote');
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

            const finalRoomLabel = roomType ? `${roomType}${roomDetail ? ` - ${roomDetail}` : ''}` : roomDetail;

            const finalItem = {
                ...product, // basic info
                id: product.id,
                title: product.title,
                selectedColor: selectedColor?.name || "Default",
                width: w,
                height: h,
                mount: mountType,
                control: motorType,
                remote: remoteType,
                controlSide: controlSide,
                room: finalRoomLabel,
                price: parseFloat(calculatePrice()),
                quantity: 1,
                JSBlindData,
                customConfigs: customConfigDetails,
                solarPanel: solarPanel,
                bondBridge: bondBridge,
                options: {
                    color: selectedColor,
                    measurements: { width: w, height: h },
                    mount: mountType,
                    motor: motorType,
                    remote: remoteType,
                    solar: solarPanel,
                    hub: bondBridge,
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
                                isComplete={!!selectedColor}
                                isRequired={true}
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
                                isComplete={!!selectedConfigs[group.id]}
                                isRequired={true}
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
                            title={`Mount Type: ${mountType ? (mountType === 'inside' ? 'Inside' : 'Outside') : 'Select Mount'}`}
                            isOpen={activeSection === 'mount'}
                            onToggle={() => setActiveSection(activeSection === 'mount' ? '' : 'mount')}
                            helpText={EXPLANATIONS.mount}
                            isComplete={!!mountType}
                            isRequired={true}
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
                            title={`Measurements: ${width && height ? `${width}${widthFraction !== '0' ? ` ${fractions.find(f => f.value === widthFraction)?.label}` : ''}" x ${height}${heightFraction !== '0' ? ` ${fractions.find(f => f.value === heightFraction)?.label}` : ''}"` : 'Select Size'}`}
                            isOpen={activeSection === 'size'}
                            onToggle={() => setActiveSection(activeSection === 'size' ? '' : 'size')}
                            helpText={EXPLANATIONS.size}
                            isComplete={!!width && !!height}
                            isRequired={true}
                            rightElement={
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsMeasureModalOpen(true); }}
                                    style={{ 
                                        padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--secondary-olive)',
                                        background: 'transparent', color: 'var(--secondary-olive)', fontSize: '0.75rem', 
                                        fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    <Ruler size={14} /> Help Me Measure
                                </button>
                            }
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '30px' }}>
                                {/* Width Selection */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', border: '1px solid #eee', borderRadius: '4px', background: '#fcfcfc', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                        <svg width="30" height="30" viewBox="0 0 100 100">
                                            <rect x="10" y="10" width="80" height="80" fill="none" stroke="#eee" strokeWidth="1" />
                                            <line x1="15" y1="50" x2="85" y2="50" stroke="orange" strokeWidth="2" />
                                            <polyline points="20,45 15,50 20,55" fill="none" stroke="orange" strokeWidth="2" />
                                            <polyline points="80,45 85,50 80,55" fill="none" stroke="orange" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', marginBottom: '4px', display: 'block' }}>WIDTH (INCH)</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <select 
                                                value={width} 
                                                onChange={(e) => setWidth(e.target.value)}
                                                style={{ flex: 1.5, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' }}
                                            >
                                                <option value="">Select Width</option>
                                                {Array.from({length: 96}, (_, i) => i + 15).map(v => (
                                                    <option key={v} value={v}>{v}"</option>
                                                ))}
                                            </select>
                                            <select 
                                                value={widthFraction} 
                                                onChange={(e) => setWidthFraction(e.target.value)}
                                                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' }}
                                            >
                                                {fractions.map(f => (
                                                    <option key={f.value} value={f.value}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <VisualRuler value={parseFloat(width) + parseFloat(widthFraction)} />
                                </div>

                                {/* Height Selection */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '50px', height: '50px', border: '1px solid #eee', borderRadius: '4px', background: '#fcfcfc', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                        <svg width="30" height="30" viewBox="0 0 100 100">
                                            <rect x="10" y="10" width="80" height="80" fill="none" stroke="#eee" strokeWidth="1" />
                                            <line x1="50" y1="15" x2="50" y2="85" stroke="orange" strokeWidth="2" />
                                            <polyline points="45,20 50,15 55,20" fill="none" stroke="orange" strokeWidth="2" />
                                            <polyline points="45,80 50,85 55,80" fill="none" stroke="orange" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', marginBottom: '4px', display: 'block' }}>HEIGHT (INCH)</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <select 
                                                value={height} 
                                                onChange={(e) => setHeight(e.target.value)}
                                                style={{ flex: 1.5, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' }}
                                            >
                                                <option value="">Select Height</option>
                                                {Array.from({length: 100}, (_, i) => i + 15).map(v => (
                                                    <option key={v} value={v}>{v}"</option>
                                                ))}
                                            </select>
                                            <select 
                                                value={heightFraction} 
                                                onChange={(e) => setHeightFraction(e.target.value)}
                                                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' }}
                                            >
                                                {fractions.map(f => (
                                                    <option key={f.value} value={f.value}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <VisualRuler value={parseFloat(height) + parseFloat(heightFraction)} />
                                </div>
                            </div>

                            {/* FIT Protection */}
                            <div style={{ 
                                background: 'rgba(235, 150, 108, 0.1)', border: '1px solid rgba(235, 150, 108, 0.3)',
                                borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '15px'
                            }}>
                                <input 
                                    type="checkbox" 
                                    id="fit-protection"
                                    checked={fitProtection}
                                    onChange={(e) => setFitProtection(e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#EB966C' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <label htmlFor="fit-protection" style={{ fontSize: '0.95rem', fontWeight: '700', color: '#333', cursor: 'pointer', display: 'block' }}>
                                        FIT Protection! <span style={{ color: '#EB966C', fontSize: '0.8rem' }}>RECOMMENDED</span>
                                    </label>
                                    <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0 0 0' }}>
                                        Add our Measuring Guarantee for FREE. Measure wrong? We replace it!
                                    </p>
                                </div>
                                <div 
                                    style={{ cursor: 'help' }}
                                    title="If you mismeasure, we will replace your blinds for free. One replacement per order. See terms for details."
                                >
                                    <Info size={18} color="#EB966C" />
                                </div>
                            </div>

                            {validationError && (
                                <div style={{ marginTop: '10px', padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} />
                                    {validationError}
                                </div>
                            )}
                        </OptionSection>

                        {/* 5. Room Name */}
                        <OptionSection
                            title={`Room Name: ${roomType ? `${roomType}${roomDetail ? ` - ${roomDetail}` : ''}` : 'Select Room'}`}
                            isOpen={activeSection === 'room'}
                            onToggle={() => setActiveSection(activeSection === 'room' ? '' : 'room')}
                            helpText={EXPLANATIONS.room}
                            isComplete={!!roomType}
                            isRequired={false}
                        >
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <select
                                    value={roomType}
                                    onChange={(e) => setRoomType(e.target.value)}
                                    style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }}
                                >
                                    <option value="">Select</option>
                                    <option value="Bedroom">Bedroom</option>
                                    <option value="Family Room">Family Room</option>
                                    <option value="Kitchen">Kitchen</option>
                                    <option value="Bathroom">Bathroom</option>
                                    <option value="Office">Office</option>
                                    <option value="Dining Room">Dining Room</option>
                                    <option value="Living Room">Living Room</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input
                                    type="text"
                                    value={roomDetail}
                                    onChange={(e) => setRoomDetail(e.target.value)}
                                    placeholder="Ex: West Wall"
                                    style={{ flex: 1.5, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }}
                                />
                            </div>
                        </OptionSection>

                        {/* 6. Lift Styles */}
                        <OptionSection
                            title={`Lift Style: ${motorType ? (motorType === 'standard' ? 'Cord Loop' : (motorType === 'cordless' ? 'Cordless' : 'Motorized')) : 'Select Style'}`}
                            isOpen={activeSection === 'motor'}
                            onToggle={() => setActiveSection(activeSection === 'motor' ? '' : 'motor')}
                            helpText="Choose how you would like to operate your shades."
                            isComplete={!!motorType}
                            isRequired={true}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                {[
                                    { id: 'standard', name: 'Continuous Cord Loop', price: 0, img: '/images/lift_cord_loop.png', isKidFriendly: false },
                                    { id: 'cordless', name: 'Premium Cordless', price: 47, img: '/images/lift_cordless.png', isKidFriendly: true },
                                    { id: 'motorized', name: 'Motorization', price: 149, img: '/images/lift_motorized.png', isKidFriendly: true }
                                ].map(l => (
                                    <div
                                        key={l.id}
                                        onClick={() => setMotorType(l.id)}
                                        style={{
                                            padding: '5px', cursor: 'pointer', textAlign: 'center', position: 'relative',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ 
                                            width: '100%', aspectRatio: '1/1', background: '#fff', borderRadius: '4px', 
                                            marginBottom: '12px', overflow: 'hidden', border: motorType === l.id ? '2px solid #333' : '1px solid #eee',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                                        }}>
                                            <img 
                                                src={l.img} 
                                                alt={l.name} 
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'contain'
                                                }} 
                                            />
                                        </div>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#333', lineHeight: '1.2' }}>{l.name}</div>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#333', margin: '4px 0' }}>
                                            {l.price === 0 ? 'Free' : `+$${l.price.toFixed(2)}`}
                                        </div>
                                        
                                        {l.isKidFriendly && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '6px' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#333', letterSpacing: '0.5px' }}>KID FRIENDLY</span>
                                                <Heart size={10} fill="#333" color="#333" />
                                            </div>
                                        )}
                                        
                                        {motorType === l.id && (
                                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#333', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
                                                <Check size={12} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </OptionSection>

                        {/* 7. Control Side */}
                        {(motorType === 'standard' || motorType === 'motorized') && (
                            <OptionSection
                                title={`${motorType === 'motorized' ? 'Motor' : 'Handle'} Side: ${controlSide || 'Select'}`}
                                isOpen={activeSection === 'side'}
                                onToggle={() => setActiveSection(activeSection === 'side' ? '' : 'side')}
                                isComplete={!!controlSide}
                                isRequired={true}
                            >
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {['Left', 'Right'].map(side => (
                                        <div
                                            key={side}
                                            onClick={() => setControlSide(side)}
                                            style={{
                                                flex: 1, padding: '15px', border: controlSide === side ? '2px solid #333' : '1px solid #eee',
                                                borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                                                background: controlSide === side ? '#fcfcfc' : '#fff',
                                                fontWeight: '700', fontSize: '0.9rem'
                                            }}
                                        >
                                            {side}
                                        </div>
                                    ))}
                                </div>
                            </OptionSection>
                        )}

                        {/* 8. Remote Control */}
                        <OptionSection
                            title={`Remote Control: ${remoteType ? (remoteType === 'none' ? 'None' : (remoteType === '1-channel' ? '1-Ch' : (remoteType === '5-channel' ? '5-Ch' : '15-Ch'))) : 'Select'}`}
                            isOpen={activeSection === 'remote'}
                            onToggle={() => setActiveSection(activeSection === 'remote' ? '' : 'remote')}
                            helpText={EXPLANATIONS.remote}
                            isComplete={!!remoteType}
                            isRequired={motorType === 'motorized'}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                {[
                                    { id: 'none', name: 'No Remote', price: 0 },
                                    { id: '1-channel', name: '1-Channel', price: 45 },
                                    { id: '5-channel', name: '5-Channel', price: 55 },
                                    { id: '15-channel', name: '15-Channel', price: 65 }
                                ].map(r => (
                                    <div
                                        key={r.id}
                                        onClick={() => setRemoteType(r.id)}
                                        onMouseEnter={() => r.image && setHoveredOption(r)}
                                        onMouseLeave={() => setHoveredOption(null)}
                                        style={{
                                            border: remoteType === r.id ? '2px solid #333' : '1px solid #ddd',
                                            borderRadius: '6px', padding: '12px', cursor: 'pointer', textAlign: 'center',
                                            background: remoteType === r.id ? '#fcfcfc' : '#fff',
                                            position: 'relative'
                                        }}
                                    >
                                        {r.isSmart && (
                                            <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-green)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>SMART HUB</div>
                                        )}
                                        <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{r.name}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '800', marginTop: '5px' }}>+${r.price}</div>
                                    </div>
                                ))}
                            </div>
                        </OptionSection>

                        {/* 9. Upgrades & Add-ons */}
                        <OptionSection
                            title="Upgrades & Add-ons"
                            isOpen={activeSection === 'addons'}
                            onToggle={() => setActiveSection(activeSection === 'addons' ? '' : 'addons')}
                            helpText={EXPLANATIONS.addons}
                            isComplete={solarPanel || bondBridge}
                            isRequired={false}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

                                <div 
                                    onClick={() => setBondBridge(!bondBridge)}
                                    onMouseEnter={() => setHoveredOption({ name: 'Bond Bridge Smart Hub', image: '/images/bond_bridge.png', price: 149 })}
                                    onMouseLeave={() => setHoveredOption(null)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                        padding: '15px', border: bondBridge ? '2px solid #333' : '1px solid #eee', 
                                        borderRadius: '8px', cursor: 'pointer', background: bondBridge ? '#fcfcfc' : '#fff'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '50%' }}><Cpu size={20} /></div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Bond Bridge Smart Hub</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>Wi-Fi, Alexa & Google Home Control</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '800' }}>+$149.00</div>
                                </div>
                            </div>
                        </OptionSection>

                        {/* 10. Remember Options */}
                        <div style={{ 
                            marginTop: '20px', padding: '15px', background: '#f8f8f8', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee'
                        }}>
                            <input 
                                type="checkbox" 
                                id="remember-options"
                                checked={rememberOptions}
                                onChange={(e) => setRememberOptions(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="remember-options" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333', cursor: 'pointer' }}>
                                Remember these options for my next item <span style={{ color: '#666', fontWeight: '400', fontSize: '0.8rem' }}>(Excluding Size)</span>
                            </label>
                        </div>
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
            
            {/* Measurement Guide Modal */}
            {isMeasureModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '800px', maxWidth: '100%',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '40px'
                    }}>
                        <button 
                            onClick={() => setIsMeasureModalOpen(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>How to Measure Guide</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '15px', color: 'var(--primary-green)' }}>Inside Mount</h3>
                                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
                                    Measure the inside width at top, middle, and bottom. Use the <strong>narrowest</strong> width. 
                                    Measure the height at left, center, and right. Use the <strong>longest</strong> height.
                                </p>
                                <img src="/images/how-to-measure-guide.jpg" alt="Inside Mount" style={{ width: '100%', borderRadius: '8px' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '15px', color: 'var(--primary-green)' }}>Outside Mount</h3>
                                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
                                    Measure the exact width you want to cover. We recommend adding 2-3 inches on each side. 
                                    Measure height from where you want the top to where you want the bottom.
                                </p>
                                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--primary-green)' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px' }}>Pro Tips:</h4>
                                    <ul style={{ fontSize: '0.85rem', color: '#555', paddingLeft: '15px' }}>
                                        <li>Always use a steel tape measure</li>
                                        <li>Round to the nearest 1/8"</li>
                                        <li>Don't make any deductions</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button 
                                onClick={() => setIsMeasureModalOpen(false)}
                                style={{ background: 'var(--primary-green)', color: 'white', padding: '12px 40px', borderRadius: '25px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Visual Ruler Component
const VisualRuler = ({ value }) => {
    // Each inch is 80px wide for better detail
    const pixelsPerInch = 80;
    const offset = value * pixelsPerInch;
    
    // Generate visible ticks for a range around the value
    const startInch = Math.floor(value) - 2;
    const endInch = Math.ceil(value) + 2;
    const ticks = [];
    
    for (let i = startInch; i <= endInch; i++) {
        if (i < 0) continue;
        
        // Full Inch
        ticks.push(
            <div key={`inch-${i}`} style={{ position: 'absolute', left: `${i * pixelsPerInch}px`, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', marginTop: '5px', color: '#333' }}>{i}</div>
                <div style={{ position: 'absolute', bottom: 0, width: '2px', height: '24px', background: '#333' }}></div>
            </div>
        );

        // Sub-ticks (1/8, 1/4, 3/8, 1/2, 5/8, 3/4, 7/8)
        for (let j = 1; j < 8; j++) {
            const fraction = j / 8;
            let height = 8; // 1/8
            let color = '#ccc';
            let width = '1px';

            if (j === 4) { height = 16; color = '#666'; width = '1.5px'; } // 1/2
            else if (j === 2 || j === 6) { height = 12; color = '#888'; width = '1px'; } // 1/4, 3/4

            ticks.push(
                <div key={`tick-${i}-${j}`} style={{ 
                    position: 'absolute', 
                    left: `${(i + fraction) * pixelsPerInch}px`, 
                    bottom: 0, 
                    width: width, 
                    height: `${height}px`, 
                    background: color,
                    transform: 'translateX(-50%)'
                }}></div>
            );
        }
    }

    return (
        <div style={{ 
            flex: 1, height: '70px', background: '#fff', borderRadius: '8px', 
            overflow: 'hidden', position: 'relative', border: '1px solid #ddd',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}>
            {/* Background pattern to look like tape */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
            
            <div style={{ 
                position: 'absolute', top: 0, left: '50%', height: '100%', 
                transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                transform: `translateX(${-offset}px)` 
            }}>
                {ticks}
            </div>
            
            {/* Center Pointer */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                <div style={{ width: '0', height: '0', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '10px solid #EB966C' }}></div>
                <div style={{ width: '2px', height: '100%', background: '#EB966C', boxShadow: '0 0 4px rgba(235, 150, 108, 0.5)' }}></div>
                <div style={{ width: '0', height: '0', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '10px solid #EB966C' }}></div>
            </div>
        </div>
    );
};

// Start of Helper Components
const OptionSection = ({ title, isOpen, onToggle, helpText, rightElement, isComplete, isRequired, children }) => {
    const [showHelp, setShowHelp] = useState(false);
    
    return (
        <div style={{ borderBottom: '1px solid #eee' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: isOpen ? '#f9f9f9' : '#fff', 
                paddingRight: '15px',
                borderLeft: isRequired && !isComplete ? '4px solid #ef4444' : (isComplete ? '4px solid #22c55e' : '4px solid transparent')
            }}>
                <div style={{ paddingLeft: '15px', display: 'flex', alignItems: 'center' }}>
                    {isComplete ? (
                        <div style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Check size={12} strokeWidth={4} />
                        </div>
                    ) : (
                        isRequired && (
                            <div style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <AlertCircle size={12} strokeWidth={4} />
                            </div>
                        )
                    )}
                </div>
                <button
                    onClick={onToggle}
                    style={{
                        flex: 1, padding: '15px 15px 15px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', 
                        fontWeight: '600', color: isRequired && !isComplete ? '#ef4444' : '#333'
                    }}
                >
                    {title}
                    {isOpen ? <ChevronUp size={20} color="#666" /> : <ChevronDown size={20} color="#666" />}
                </button>
                {rightElement}
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
