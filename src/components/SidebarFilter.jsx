import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h4>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            {isOpen && <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>{children}</div>}
        </div>
    );
};

const CategoryLink = ({ label, categoryKey, currentCategory }) => {
    const isActive = currentCategory === categoryKey;
    return (
        <Link
            to={categoryKey ? `/products?category=${categoryKey}` : '/products'}
            style={{
                display: 'block',
                fontSize: '0.85rem',
                color: isActive ? 'var(--primary-blue)' : '#555',
                fontWeight: isActive ? '700' : '500',
                padding: '8px 0',
                transition: 'var(--transition)',
                textTransform: 'uppercase'
            }}
        >
            {label}
        </Link>
    );
};

const SidebarFilter = ({ categories }) => {
    const [searchParams] = useSearchParams();
    const currentCategory = searchParams.get('category');

    const productCategories = [
        { label: "All Collections", key: null },
        { label: "Roller Shades", key: "roller" },
        { label: "Zebra Shades", key: "zebra" }
    ];

    const techCategories = [
        { label: "Matter & Thread", key: "matter" },
        { label: "Apple HomeKit", key: "homekit" },
        { label: "Remotes & Hubs", key: "motor" }
    ];

    const displayCategories = categories || productCategories;

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
                    />
                ))}
            </FilterSection>

            {/* Tech Categories */}
            <FilterSection title="Smart Technology" defaultOpen={false}>
                {techCategories.map((cat, index) => (
                    <CategoryLink
                        key={index}
                        label={cat.label}
                        categoryKey={cat.key}
                        currentCategory={currentCategory}
                    />
                ))}
            </FilterSection>

            {/* Price Filter */}
            <FilterSection title="Price Range">
                <div style={{ padding: '0 5px' }}>
                    <div style={{ height: '3px', background: '#eee', position: 'relative', margin: '20px 0' }}>
                        <div style={{ position: 'absolute', left: '0%', right: '0%', top: 0, bottom: 0, background: 'var(--primary-blue)', opacity: 0.3 }}></div>
                        <div style={{ position: 'absolute', left: '0%', top: '-6px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--secondary-slate)', cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                        <div style={{ position: 'absolute', right: '0%', top: '-6px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--secondary-slate)', cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: '700' }}>
                        <span>$0</span>
                        <span>$1,000+</span>
                    </div>
                </div>
            </FilterSection>

            {/* Opacity/Light Filtering */}
            <FilterSection title="Opacity" defaultOpen={false}>
                {['Blackout', 'Light Filtering', 'Sheer', 'Sunscreen'].map((op, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#555', marginBottom: '8px' }}>
                        <input type="checkbox" />
                        <span>{op}</span>
                    </div>
                ))}
            </FilterSection>
        </div>
    );
};

export default SidebarFilter;
