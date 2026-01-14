import React from 'react';
import SidebarFilter from './SidebarFilter';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

const ProductListing = ({ title, products, breadcrumbs }) => {
    return (
        <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
            {/* Collection Header Banner */}
            <div style={{ 
                backgroundColor: '#fff', 
                padding: '80px 0 60px', 
                textAlign: 'center',
                borderBottom: '1px solid #e5e5e5'
            }}>
                <div className="container">
                    <div style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '600', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1.5px', 
                        color: '#86868b', 
                        marginBottom: '16px' 
                    }}>
                        {breadcrumbs && breadcrumbs.join(' / ')}
                    </div>
                    <h1 style={{ 
                        fontSize: '3rem', 
                        fontWeight: '700', 
                        margin: 0, 
                        letterSpacing: '-0.5px',
                        color: '#1d1d1f'
                    }}>
                        {title}
                    </h1>
                </div>
            </div>

            <div className="container" style={{ padding: '50px 20px 80px' }}>
                <div style={{ display: 'flex', gap: '60px' }}>
                    {/* Sidebar */}
                    <aside className="desktop-sidebar" style={{ width: '220px', flexShrink: 0 }}>
                        <SidebarFilter />
                    </aside>

                    {/* Product Grid Area */}
                    <main style={{ flex: 1 }}>
                        {/* Toolbar */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '40px', 
                            paddingBottom: '20px',
                            borderBottom: '1px solid #e5e5e5'
                        }}>
                            <span style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: '500', 
                                color: '#86868b',
                                letterSpacing: '0.3px'
                            }}>
                                {products && Array.isArray(products) ? products.length : 0} Products
                            </span>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                fontSize: '0.8rem', 
                                fontWeight: '500', 
                                cursor: 'pointer',
                                color: '#1d1d1f',
                                padding: '8px 12px',
                                borderRadius: '20px',
                                border: '1px solid #e5e5e5',
                                background: '#fff',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.borderColor = '#1d1d1f';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.borderColor = '#e5e5e5';
                            }}
                            >
                                <SlidersHorizontal size={14} />
                                <span>Filter & Sort</span>
                            </div>
                        </div>

                        {/* Responsive Sidebar Hide CSS */}
                        <style>{`
                            @media (max-width: 1024px) {
                                .desktop-sidebar { display: none !important; }
                            }
                            .grid-3 {
                                display: grid;
                                grid-template-columns: repeat(3, 1fr);
                                gap: 32px 24px;
                            }
                            @media (max-width: 1024px) {
                                .grid-3 {
                                    grid-template-columns: repeat(2, 1fr);
                                    gap: 28px 20px;
                                }
                            }
                            @media (max-width: 640px) {
                                .grid-3 {
                                    grid-template-columns: 1fr;
                                    gap: 24px;
                                }
                            }
                        `}</style>

                        {/* Grid */}
                        <div className="grid-3">
                            {products}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
