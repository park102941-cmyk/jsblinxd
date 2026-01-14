import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ProductCard = ({ id, title, price, originalPrice, image, badge, reviews, colors }) => {
    return (
        <Link to={`/product/${id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="product-card" style={{
                background: '#fff',
                transition: 'all 0.3s ease',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '0',
                overflow: 'hidden',
                border: 'none',
                height: '100%'
            }}
            onMouseOver={e => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
                {/* Image Area */}
                <div style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    backgroundColor: '#f8f8f8',
                    overflow: 'hidden'
                }}>
                    {/* Badge */}
                    {badge && (
                        <div style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            background: 'var(--primary-green)',
                            color: 'white',
                            padding: '6px 14px',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            zIndex: 2,
                            textTransform: 'uppercase',
                            borderRadius: '4px',
                            letterSpacing: '0.5px'
                        }}>
                            {badge}
                        </div>
                    )}

                    {image ?
                        <img 
                            src={image} 
                            alt={title} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.4s ease'
                            }} 
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        /> :
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '0.9rem' }}>No Image</div>
                    }
                </div>

                {/* Content Area */}
                <div style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Reviews */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        marginBottom: '12px' 
                    }}>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} fill="#FFB800" color="#FFB800" strokeWidth={0} />
                        ))}
                        <span style={{ fontSize: '0.75rem', color: '#86868b', marginLeft: '6px', fontWeight: '400' }}>({reviews || 0})</span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        marginBottom: '12px',
                        lineHeight: '1.4',
                        color: '#1d1d1f',
                        minHeight: '2.8rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {title}
                    </h3>

                    {/* Color Dots */}
                    {colors && colors.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            {colors.slice(0, 6).map((c, i) => (
                                <div key={i} style={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    borderRadius: '50%', 
                                    border: '1px solid #e5e5e5',
                                    backgroundColor: c.startsWith('http') ? 'transparent' : c,
                                    backgroundImage: c.startsWith('http') ? `url(${c})` : 'none',
                                    backgroundSize: 'cover',
                                    flexShrink: 0
                                }} />
                            ))}
                            {colors.length > 6 && <span style={{ fontSize: '0.7rem', color: '#86868b', alignSelf: 'center' }}>+{colors.length - 6}</span>}
                        </div>
                    )}

                    {/* Price */}
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ color: '#1d1d1f', fontWeight: '600', fontSize: '1.15rem' }}>From ${price}</span>
                        {originalPrice && (
                            <span style={{ color: '#86868b', textDecoration: 'line-through', fontSize: '0.9rem' }}>${originalPrice}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
