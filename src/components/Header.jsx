import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ArrowRight, Truck, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const Header = () => {
    const { currentUser } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "categories"));
                const catList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(catList.filter(c => c.isVisible !== false).sort((a, b) => (a.order || 0) - (b.order || 0)));
            } catch (error) {
                console.error("Error fetching categories for header:", error);
            }
        };
        fetchCategories();
    }, []);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            {/* Announcement Bar */}
            <div style={{
                backgroundColor: 'var(--primary-blue)',
                color: 'white',
                textAlign: 'center',
                padding: '10px 0',
                fontSize: '0.8rem',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
            }}>
                <Truck size={14} /> FREE SHIPPING WITHIN US ON ALL ORDERS OVER $300
                <Link to="/products" style={{ textDecoration: 'underline', marginLeft: '10px' }}>Shop Now</Link>
            </div>

            <header style={{
                backgroundColor: 'var(--bg-white)',
                borderBottom: '1px solid var(--border-color)',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: 'var(--box-shadow-sm)'
            }}>
                <div className="container" style={{
                    height: '90px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1001 }}>
                        <img src="/logo.png" alt="JSBlind Logo" style={{ height: '55px' }} />
                        <span style={{ 
                            fontSize: '1.8rem', 
                            fontWeight: '800', 
                            color: 'var(--secondary-olive)', 
                            letterSpacing: '-1px',
                            textTransform: 'uppercase'
                        }}>JSBlind</span>
                    </Link>

                    {/* Desktop Navigation (Smartwings Style Mega Menu) */}
                    <nav className="desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <ul style={{
                            display: 'flex',
                            listStyle: 'none',
                            gap: '30px',
                            margin: 0,
                            padding: 0
                        }}>
                            {/* Blinds & Shades Mega Dropdown */}
                            <li className="nav-item-dropdown" style={{ position: 'relative' }}>
                                <Link to="/products" style={{ 
                                    color: 'var(--text-main)', 
                                    fontWeight: '600', 
                                    fontSize: '0.85rem', 
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>Blinds & Shades <ChevronDown size={14} /></Link>
                                <div className="mega-menu">
                                    <div className="mega-menu-content">
                                        <div className="mega-column">
                                            <h4>Shades</h4>
                                            <Link to="/products?category=roller">Roller Shades</Link>
                                            <Link to="/products?category=cellular">Cellular Shades</Link>
                                            <Link to="/products?category=zebra">Zebra Shades</Link>
                                            <Link to="/products?category=roman">Roman Shades</Link>
                                            <Link to="/products?category=woven">Woven Wood Shades</Link>
                                        </div>
                                        <div className="mega-column">
                                            <h4>Blinds</h4>
                                            <Link to="/products?category=wood">Wood Blinds</Link>
                                            <Link to="/products?category=faux">Faux Wood Blinds</Link>
                                            <Link to="/products?category=venetian">Venetian Blinds</Link>
                                            <Link to="/products?category=vertical">Vertical Blinds</Link>
                                        </div>
                                        <div className="mega-column">
                                            <h4>Specialty</h4>
                                            <Link to="/products?category=outdoor">Outdoor Shades</Link>
                                            <Link to="/products?category=dual">Dual Shades</Link>
                                            <Link to="/products?category=skylight">Skylight Shades</Link>
                                        </div>
                                    </div>
                                    {/* Dynamic Categories if any */}
                                    {categories.length > 0 && (
                                        <div className="mega-menu-content" style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px' }}>
                                            <div className="mega-column">
                                                <h4>More Collections</h4>
                                                {categories.filter(c => !['roller', 'cellular', 'zebra', 'roman', 'woven', 'wood', 'faux', 'venetian', 'vertical', 'outdoor', 'dual', 'skylight'].includes(c.id)).map(c => (
                                                    <Link key={c.id} to={`/products?category=${c.id}`}>{c.name}</Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>

                            <li className="nav-item-dropdown" style={{ position: 'relative' }}>
                                <Link to="/products?category=curtains" style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>Curtains <ChevronDown size={14} /></Link>
                                <div className="dropdown-menu">
                                    <Link to="/products?category=motor_curtain">Motorized Drapery</Link>
                                    <Link to="/products?category=curtain_rods">Smart Rods</Link>
                                </div>
                            </li>

                            <li className="nav-item-dropdown" style={{ position: 'relative' }}>
                                <Link to="/products?category=motor" style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>Smart Tech <ChevronDown size={14} /></Link>
                                <div className="dropdown-menu">
                                    <Link to="/products?category=matter">Matter & Thread</Link>
                                    <Link to="/products?category=homekit">Apple HomeKit</Link>
                                    <Link to="/products?category=remotes">Remotes & Hubs</Link>
                                </div>
                            </li>


                            <li><Link to="/swatches" style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Swatches</Link></li>
                            <li><Link to="/help" style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Help Center</Link></li>
                        </ul>
                    </nav>

                    {/* Utilities */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                        <div className="icon-btn search-trigger" style={{ cursor: 'pointer', color: 'var(--text-main)' }} onClick={() => setSearchOpen(!searchOpen)}>
                            <Search size={22} />
                        </div>

                        <Link to="/cart" className="icon-btn" style={{ cursor: 'pointer', position: 'relative', color: 'var(--text-main)' }}>
                            <ShoppingCart size={22} />
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'var(--primary-blue)',
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white'
                            }}>{cartCount}</span>
                        </Link>

                        <div className="auth-utility" style={{ display: 'flex', alignItems: 'center' }}>
                            {currentUser ? (
                                <Link to="/account" className="icon-btn" style={{ color: 'var(--text-main)' }}>
                                    <User size={22} />
                                </Link>
                            ) : (
                                <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Login</Link>
                            )}
                        </div>

                        <div className="mobile-toggle" style={{ cursor: 'pointer', display: 'none' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </div>
                    </div>
                </div>

                {/* Search Bar Overlay */}
                {searchOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        padding: '20px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        borderTop: '1px solid #eee'
                    }}>
                        <div className="container">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setSearchOpen(false);
                                    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
                            >
                                <Search size={24} color="#999" />
                                <input 
                                    type="text" 
                                    autoFocus
                                    placeholder="SEARCH FOR SMART BLINDS..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        border: 'none', 
                                        fontSize: '1.2rem', 
                                        outline: 'none',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}
                                />
                                <X size={24} onClick={() => setSearchOpen(false)} style={{ cursor: 'pointer' }} />
                            </form>
                        </div>
                    </div>
                )}
            </header>

            {/* Sub-menu Styles */}
            <style>{`
                .nav-item-dropdown:hover .dropdown-menu,
                .nav-item-dropdown:hover .mega-menu {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background: white;
                    min-width: 220px;
                    box-shadow: var(--box-shadow-md);
                    border-radius: 4px;
                    padding: 15px 0;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: var(--transition);
                    z-index: 1000;
                }
                .dropdown-menu a {
                    display: block;
                    padding: 10px 25px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--text-main);
                    text-transform: uppercase;
                }
                .dropdown-menu a:hover {
                    background: var(--light-gray);
                    color: var(--primary-blue);
                }

                /* Mega Menu Style */
                .mega-menu {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    background: white;
                    width: auto;
                    min-width: 250px;
                    box-shadow: var(--box-shadow-md);
                    padding: 30px;
                    opacity: 0;
                    visibility: hidden;
                    transition: var(--transition);
                    z-index: 1000;
                    border-radius: 8px;
                }
                .mega-menu-content {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 40px;
                }
                .mega-column h4 {
                    font-size: 0.9rem;
                    font-weight: 800;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    color: var(--primary-blue);
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 10px;
                }
                .mega-column a {
                    display: block;
                    padding: 8px 0;
                    font-size: 0.85rem;
                    color: var(--text-main);
                    font-weight: 500;
                }
                .mega-column a:hover {
                    color: var(--primary-blue);
                    padding-left: 5px;
                }

                @media (max-width: 1024px) {
                    .desktop-nav { display: none !important; }
                    .mobile-toggle { display: block !important; }
                    .auth-utility { display: none !important; }
                }
            `}</style>
        </>
    );
};

export default Header;
