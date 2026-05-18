import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '20px', marginBottom: '20px' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: '10px'
                }}
            >
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: '#1d1d1f' }}>{title}</h4>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            {isOpen && <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>{children}</div>}
        </div>
    );
};

const CategoryLink = ({ label, categoryKey, currentCategory, searchParams }) => {
    const isActive = currentCategory === categoryKey;
    const newParams = new URLSearchParams(searchParams);
    if (categoryKey) {
        newParams.set('category', categoryKey);
    } else {
        newParams.delete('category');
    }

    return (
        <Link
            to={`/products?${newParams.toString()}`}
            style={{
                display: 'block',
                fontSize: '0.85rem',
                color: isActive ? 'var(--primary-blue)' : '#555',
                fontWeight: isActive ? '700' : '500',
                padding: '8px 0',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase'
            }}
        >
            {label}
        </Link>
    );
};

const SidebarFilter = ({ categories }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentCategory = searchParams.get('category');

    const minPrice = Number(searchParams.get('minPrice') || 0);
    const maxPrice = Number(searchParams.get('maxPrice') || 1000);
    const opacityParam = searchParams.get('opacity') || '';
    const selectedOpacities = opacityParam ? opacityParam.split(',') : [];

    const displayCategories = [
        { label: "Roller Shades", key: "roller" },
        { label: "Zebra Shades", key: "zebra" },
        { label: "Accessories", key: "motor" }
    ];

    const handlePriceSliderChange = (e) => {
        const value = Number(e.target.value);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('maxPrice', value);
        setSearchParams(newParams);
    };

    const handleMinPriceChange = (val) => {
        const newParams = new URLSearchParams(searchParams);
        if (val === '' || isNaN(val)) {
            newParams.delete('minPrice');
        } else {
            newParams.set('minPrice', Math.max(0, Number(val)));
        }
        setSearchParams(newParams);
    };

    const handleMaxPriceChange = (val) => {
        const newParams = new URLSearchParams(searchParams);
        if (val === '' || isNaN(val)) {
            newParams.delete('maxPrice');
        } else {
            newParams.set('maxPrice', Math.max(0, Number(val)));
        }
        setSearchParams(newParams);
    };

    const handleOpacityToggle = (opKey) => {
        const newParams = new URLSearchParams(searchParams);
        let newList = [...selectedOpacities];

        if (newList.includes(opKey)) {
            newList = newList.filter(item => item !== opKey);
        } else {
            newList.push(opKey);
        }

        if (newList.length > 0) {
            newParams.set('opacity', newList.join(','));
        } else {
            newParams.delete('opacity');
        }
        setSearchParams(newParams);
    };

    const handleClearAll = () => {
        const newParams = new URLSearchParams();
        if (currentCategory) {
            newParams.set('category', currentCategory);
        }
        setSearchParams(newParams);
    };

    const hasActiveFilters = minPrice > 0 || maxPrice < 1000 || selectedOpacities.length > 0;

    return (
        <div style={{ paddingRight: '10px' }}>
            {/* Main Collections */}
            <FilterSection title="Collections">
                {displayCategories.map((cat, index) => (
                    <CategoryLink
                        key={index}
                        label={cat.label}
                        categoryKey={cat.key}
                        currentCategory={currentCategory}
                        searchParams={searchParams}
                    />
                ))}
            </FilterSection>

            {/* Price Filter */}
            <FilterSection title="Price Range" defaultOpen={true}>
                <div style={{ padding: '0 5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#555', marginBottom: '8px' }}>
                        <span>Max Price:</span>
                        <span style={{ fontWeight: '700', color: 'var(--primary-blue)' }}>
                            {maxPrice >= 1000 ? '$1,000+' : `$${maxPrice}`}
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        step="50"
                        value={maxPrice} 
                        onChange={handlePriceSliderChange}
                        style={{ width: '100%', accentColor: 'var(--primary-blue)', cursor: 'pointer', marginBottom: '15px' }} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: '12px' }}>
                        <span>$0</span>
                        <span>$1,000+</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: '2px', textTransform: 'uppercase', fontWeight: '600' }}>Min ($)</span>
                            <input 
                                type="number" 
                                min="0"
                                value={minPrice || ''} 
                                onChange={(e) => handleMinPriceChange(e.target.value)} 
                                style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid #e5e5e5', borderRadius: '6px', background: '#fff', color: '#1d1d1f' }} 
                            />
                        </div>
                        <span style={{ color: '#888', marginTop: '15px' }}>-</span>
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: '2px', textTransform: 'uppercase', fontWeight: '600' }}>Max ($)</span>
                            <input 
                                type="number" 
                                min="0"
                                value={maxPrice >= 1000 ? '' : maxPrice} 
                                placeholder={maxPrice >= 1000 ? '1000+' : ''}
                                onChange={(e) => handleMaxPriceChange(e.target.value)} 
                                style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid #e5e5e5', borderRadius: '6px', background: '#fff', color: '#1d1d1f' }} 
                            />
                        </div>
                    </div>
                </div>
            </FilterSection>

            {/* Opacity/Light Filtering */}
            <FilterSection title="Opacity" defaultOpen={true}>
                {['Blackout', 'Light Filtering', 'Sheer', 'Sunscreen'].map((op, i) => {
                    const opKey = op.toLowerCase().replace(' ', '-');
                    const isChecked = selectedOpacities.includes(opKey);
                    return (
                        <label 
                            key={i} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                fontSize: '0.85rem', 
                                color: '#1d1d1f', 
                                marginBottom: '8px', 
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                        >
                            <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => handleOpacityToggle(opKey)}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    accentColor: 'var(--primary-blue)',
                                    cursor: 'pointer'
                                }}
                            />
                            <span>{op}</span>
                        </label>
                    );
                })}
            </FilterSection>

            {/* Reset Button */}
            {hasActiveFilters && (
                <button 
                    onClick={handleClearAll}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#f5f5f7',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#1d1d1f',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '10px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#e8e8ed'}
                    onMouseOut={e => e.currentTarget.style.background = '#f5f5f7'}
                >
                    <RotateCcw size={13} />
                    <span>Clear Filters</span>
                </button>
            )}
        </div>
    );
};

export default SidebarFilter;
