import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, X, ChevronLeft, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'light-zebra', name: 'Light Filtering Zebra', label: 'Zebra (Light Filter)' },
  { id: 'blackout-zebra', name: 'Blackout Zebra', label: 'Zebra (Blackout)' },
  { id: 'light-roller', name: 'Light Filtering Roller', label: 'Roller (Light Filter)' },
  { id: 'blackout-roller', name: 'Blackout Roller', label: 'Roller (Blackout)' },
  { id: 'smart-device', name: 'Smart Device & Accessories', label: 'Smart Device' }
];

const INITIAL_GALLERY_ITEMS = [
  // 1. Blackout Zebra (Using the exact beautiful high-res uploaded files)
  {
    id: 'bz1',
    category: 'blackout-zebra',
    title: 'Modern Living Zebra Blackout',
    desc: 'Luxurious dual-band zebra shades in light-brown, perfectly blocking solar glare while keeping the living room warm and cozy.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779116619667.png',
    link: '/products?category=zebra&opacity=blackout'
  },
  {
    id: 'bz2',
    category: 'blackout-zebra',
    title: 'High-Ceiling Living Room Zebra Blackout',
    desc: 'Spectacular multi-pane vertical zebra installation in deep charcoal, adding a majestic architecture feel to modern high ceilings.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779116622344.png',
    link: '/products?category=zebra&opacity=blackout'
  },
  {
    id: 'bz3',
    category: 'blackout-zebra',
    title: 'Elegant Bay Windows Zebra Blackout',
    desc: 'Warm beige blackout zebra shades with high precision alignment, complementing custom architraves and neutral bedroom decors.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779116624739.png',
    link: '/products?category=zebra&opacity=blackout'
  },
  {
    id: 'bz4',
    category: 'blackout-zebra',
    title: 'Luxury Double-Height Zebra Blackout',
    desc: 'Premium dark-weave double-story blackout shades protecting delicate high-end furniture from direct ultraviolet damage.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779116630201.png',
    link: '/products?category=zebra&opacity=blackout'
  },

  // 2. Light Filtering Zebra
  {
    id: 'lz1',
    category: 'light-zebra',
    title: 'Bright Living Room Zebra Installation',
    desc: 'Soft golden-toned light filtering zebra shades installed in a modern open-plan living room, diffusing sunlight beautifully.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115035915.png',
    link: '/products?category=zebra&opacity=light-filtering'
  },
  {
    id: 'lz2',
    category: 'light-zebra',
    title: 'Cream Zebra in Bedroom Suite',
    desc: 'Warm white light-filtering zebra shades creating a tranquil, sun-kissed ambiance in a luxurious master bedroom.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115040321.png',
    link: '/products?category=zebra&opacity=light-filtering'
  },
  {
    id: 'lz3',
    category: 'light-zebra',
    title: 'Modern Grey Zebra Office Look',
    desc: 'Chic charcoal stripe light-filtering zebra shades installed in a sleek executive workspace with floor-to-ceiling windows.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115045759.png',
    link: '/products?category=zebra&opacity=light-filtering'
  },

  // 3. Light Filtering Roller
  {
    id: 'lr1',
    category: 'light-roller',
    title: 'Cream Roller in Open Kitchen',
    desc: 'Premium cream light-filtering roller shades installed in a bright modern open kitchen, softening midday sunlight.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115050708.png',
    link: '/products?category=roller&opacity=light-filtering'
  },
  {
    id: 'lr2',
    category: 'light-roller',
    title: 'Neutral Roller in Dining Area',
    desc: 'Elegant translucent roller fabric diffusing morning glare in a contemporary dining area with neutral tones.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115057260.png',
    link: '/products?category=roller&opacity=light-filtering'
  },

  // 4. Blackout Roller
  {
    id: 'br1',
    category: 'blackout-roller',
    title: 'Midnight Blackout Roller — Master Suite',
    desc: 'Premium dark-charcoal blackout roller shades blocking 100% of light for uninterrupted sleep in a luxury bedroom.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115060243.png',
    link: '/products?category=roller&opacity=blackout'
  },
  {
    id: 'br2',
    category: 'blackout-roller',
    title: 'Slate Grey Blackout Bay Windows',
    desc: 'High-density slate grey blackout roller shades perfectly fitted across wide bay windows to eliminate external glare.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115061426.png',
    link: '/products?category=roller&opacity=blackout'
  },

  // 5. Smart Devices & Accessories
  {
    id: 'sd1',
    category: 'smart-device',
    title: 'Smart Hub Integration — Home Office',
    desc: 'Smart RF bridge hub seamlessly installed in a minimalist home office, enabling full voice and app control of motorized shades.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115064756.png',
    link: '/products?category=motor'
  },
  {
    id: 'sd2',
    category: 'smart-device',
    title: 'Motorized Smart Shades — Living Room',
    desc: 'Motorized roller shades controlled via smart hub, scheduled automatically to protect furniture from afternoon UV exposure.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115070112.png',
    link: '/products?category=motor'
  },
  {
    id: 'sd3',
    category: 'smart-device',
    title: 'Alexa-Integrated Motorized Blinds',
    desc: 'Rechargeable motorized blind system integrated with Alexa and Google Home for hands-free smart home automation.',
    image: '/images/gallery/media_c2491bc7-c990-420c-a66b-cfde0360a96d_1779115075033.png',
    link: '/products?category=motor'
  }
];

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('blackout-zebra');
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "gallery_items"));
        let itemsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (itemsList.length === 0) {
          // Initialize gallery collection
          const promises = INITIAL_GALLERY_ITEMS.map(item => 
            setDoc(doc(db, "gallery_items", item.id), item)
          );
          await Promise.all(promises);
          itemsList = [...INITIAL_GALLERY_ITEMS];
        }
        
        setGalleryItems(itemsList);
      } catch (error) {
        console.error("Error loading lookbook gallery:", error);
        setGalleryItems(INITIAL_GALLERY_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Filter items based on active tab
  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => item.category === activeTab);
  }, [galleryItems, activeTab]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex(prev => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex(prev => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Title Header Block */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'var(--primary-green)',
          display: 'block',
          marginBottom: '10px'
        }}>
          Inspired Spaces
        </span>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1d1d1f',
          margin: '0 0 16px 0',
          letterSpacing: '-0.5px'
        }}>
          Lookbook & Reference Gallery
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#86868b',
          maxWidth: '650px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Browse actual installations, gorgeous lookbooks, and light-diffusing reference pictures of our premium blinds and smart devices in luxury real-world interiors.
        </p>
      </div>

      {/* Modern Horizontal Tabs Nav */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '40px',
        padding: '6px',
        background: '#e8e8ed',
        borderRadius: '30px',
        maxWidth: '920px',
        margin: '0 auto 40px auto'
      }}>
        {CATEGORIES.map(cat => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              style={{
                border: 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? 'var(--primary-green)' : '#515154',
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: isActive ? '600' : '500',
                borderRadius: '25px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid Container */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '15px' }}>
          <Loader2 className="spin" size={40} color="var(--primary-green)" />
          <p style={{ color: '#86868b', fontSize: '0.95rem' }}>Loading inspired spaces...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', background: '#f5f5f7', borderRadius: '16px', padding: '40px' }}>
          <p style={{ color: '#86868b', fontSize: '1rem', fontWeight: '500', margin: 0 }}>No showcase items in this category yet.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          animation: 'fadeIn 0.5s ease-in-out'
        }}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => openLightbox(index)}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
              }}
            >
              {/* Image Wrap */}
              <div style={{
                width: '100%',
                paddingTop: '100%', // 1:1 Aspect Ratio
                position: 'relative',
                background: '#f5f5f7',
                overflow: 'hidden'
              }}>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <Maximize2 size={14} color="#1d1d1f" />
                </div>
              </div>

              {/* Content info block */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  margin: '0 0 8px 0',
                  lineHeight: '1.4'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#6e6e73',
                  lineHeight: '1.5',
                  margin: '0 0 16px 0',
                  flex: 1
                }}>
                  {item.desc}
                </p>
                
                <Link
                  to={item.link || '#'}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--primary-green)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginTop: 'auto',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <ShoppingBag size={14} />
                  Shop Collection →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal Box */}
      {lightboxIndex !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={24} />
          </button>

          {/* Prev Nav Button */}
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Main Content Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '900px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
          >
            {/* Image box */}
            <div style={{
              background: '#000000',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              maxHeight: '65vh'
            }}>
              <img
                src={filteredItems[lightboxIndex]?.image}
                alt={filteredItems[lightboxIndex]?.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Description details block */}
            <div style={{ padding: '24px 30px', background: '#ffffff', borderTop: '1px solid #f5f5f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'var(--primary-green)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    {CATEGORIES.find(c => c.id === activeTab)?.name}
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1d1d1f', margin: '0 0 10px 0' }}>
                    {filteredItems[lightboxIndex]?.title}
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#6e6e73', lineHeight: '1.5', margin: 0 }}>
                    {filteredItems[lightboxIndex]?.desc}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Link
                    to={filteredItems[lightboxIndex]?.link || '#'}
                    style={{
                      background: 'var(--primary-green)',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '12px 24px',
                      borderRadius: '25px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(107, 116, 103, 0.25)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <ShoppingBag size={16} />
                    Shop This Look
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Next Nav Button */}
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
