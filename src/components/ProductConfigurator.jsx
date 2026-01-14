import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, Info } from 'lucide-react';

const ConfigSection = ({ title, isOpen, onToggle, children, selection }) => {
    return (
        <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '20px', marginBottom: '20px' }}>
            <div
                onClick={onToggle}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: isOpen ? '15px' : '0'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '500', margin: 0, color: '#333' }}>{title}</h3>
                    {selection && !isOpen && <span style={{ fontSize: '0.9rem', color: '#666' }}>: {selection}</span>}
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {isOpen && <div style={{ animation: 'fadeIn 0.3s' }}>{children}</div>}
        </div>
    );
};

const OptionCard = ({ label, image, description, selected, onClick, priceMod }) => (
    <div
        onClick={onClick}
        style={{
            border: selected ? '2px solid #4A4E53' : '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            backgroundColor: selected ? '#f9f9f9' : 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}
    >
        {selected && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#4A4E53' }}>
                <Check size={18} />
            </div>
        )}
        {image && <img src={image} alt={label} style={{ width: '100%', height: '80px', objectFit: 'contain', marginBottom: '5px' }} />}
        <div>
            <div style={{ fontWeight: '500', marginBottom: '5px' }}>{label}</div>
            {description && <div style={{ fontSize: '0.8rem', color: '#666' }}>{description}</div>}
            {priceMod > 0 && <div style={{ fontSize: '0.85rem', color: '#E53935', marginTop: '5px' }}>+${priceMod}</div>}
        </div>
    </div>
);

const ProductConfigurator = ({ basePrice, onPriceUpdate, selections, onSelectionChange }) => {
    // State for sections
    const [openSection, setOpenSection] = useState('fabric');

    // Selection State managed by parent now
    // const [selections, setSelections] = useState(...);

    // Mock Options Data
    const fabricOptions = [
        { id: 1, name: 'Textured Grey', img: null, price: 0 },
        { id: 2, name: 'Classic Beige', img: null, price: 0 },
        { id: 3, name: 'Charcoal Blackout', img: null, price: 20 },
        { id: 4, name: 'Pure White', img: null, price: 0 },
    ];

    const mountOptions = [
        { id: 'inside', name: 'Inside Mount', desc: 'Fits inside the window frame.', price: 0 },
        { id: 'outside', name: 'Outside Mount', desc: 'Mounts on the wall above the window.', price: 0 },
    ];

    const controlOptions = [
        { id: 'manual', name: 'Manual Chain', desc: 'Standard beaded chain control.', price: 0 },
        { id: 'motor_z', name: 'Zigbee Motor', desc: 'Smart control, requires hub.', price: 120 },
        { id: 'motor_m', name: 'Matter Motor', desc: 'Works with Apple/Google/Alexa directly.', price: 150 },
    ];

    // Calculate Total Price
    useEffect(() => {
        let total = basePrice;
        total += selections.fabric.price;
        total += selections.mount.price;
        total += selections.control.price;
        // Simple size calculation: e.g., $1 per inch over 24x36
        const area = selections.measurements.width * selections.measurements.height;
        const baseArea = 24 * 36;
        if (area > baseArea) {
            total += (area - baseArea) * 0.05;
        }

        onPriceUpdate(Math.round(total));
    }, [selections, basePrice, onPriceUpdate]);


    const handleSelection = (category, value) => {
        onSelectionChange(prev => ({
            ...prev,
            [category]: value
        }));
    };

    return (
        <div className="product-configurator">
            {/* 1. Fabric Selection */}
            <ConfigSection
                title="1. Select Fabric"
                isOpen={openSection === 'fabric'}
                onToggle={() => setOpenSection(openSection === 'fabric' ? '' : 'fabric')}
                selection={selections.fabric.name}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    {fabricOptions.map(opt => (
                        <OptionCard
                            key={opt.id}
                            label={opt.name}
                            priceMod={opt.price}
                            selected={selections.fabric.name === opt.name}
                            onClick={() => handleSelection('fabric', opt)}
                        />
                    ))}
                </div>
            </ConfigSection>

            {/* 2. Mount Type */}
            <ConfigSection
                title="2. Mount Type"
                isOpen={openSection === 'mount'}
                onToggle={() => setOpenSection(openSection === 'mount' ? '' : 'mount')}
                selection={selections.mount.name}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    {mountOptions.map(opt => (
                        <OptionCard
                            key={opt.id}
                            label={opt.name}
                            description={opt.desc}
                            selected={selections.mount.name === opt.name}
                            onClick={() => handleSelection('mount', opt)}
                        />
                    ))}
                </div>
            </ConfigSection>

            {/* 3. Measurements */}
            <ConfigSection
                title="3. Measurements"
                isOpen={openSection === 'measure'}
                onToggle={() => setOpenSection(openSection === 'measure' ? '' : 'measure')}
                selection={`${selections.measurements.width}" W x ${selections.measurements.height}" H`}
            >
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Width (inches)</label>
                        <input
                            type="number"
                            value={selections.measurements.width}
                            onChange={(e) => onSelectionChange(prev => ({ ...prev, measurements: { ...prev.measurements, width: parseInt(e.target.value) || 0 } }))}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Height (inches)</label>
                        <input
                            type="number"
                            value={selections.measurements.height}
                            onChange={(e) => onSelectionChange(prev => ({ ...prev, measurements: { ...prev.measurements, height: parseInt(e.target.value) || 0 } }))}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>
            </ConfigSection>

            {/* 4. Control Type */}
            <ConfigSection
                title="4. Control Type"
                isOpen={openSection === 'control'}
                onToggle={() => setOpenSection(openSection === 'control' ? '' : 'control')}
                selection={selections.control.name}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {controlOptions.map(opt => (
                        <OptionCard
                            key={opt.id}
                            label={opt.name}
                            description={opt.desc}
                            priceMod={opt.price}
                            selected={selections.control.name === opt.name}
                            onClick={() => handleSelection('control', opt)}
                        />
                    ))}
                </div>
            </ConfigSection>
        </div>
    );
};

export default ProductConfigurator;
