import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, RefreshCw, Wand2, Check, X, Camera, Zap } from 'lucide-react';

const AIColorVision = ({ product, currentColor, onColorSelect }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewMode, setViewMode] = useState('standard'); // 'standard' or 'ai'
    const [aiVariation, setAiVariation] = useState(null);
    const [selectedPrompt, setSelectedPrompt] = useState('Modern Minimalist');

    // Mock AI variations based on the generated images for the demo
    const mockAiVariations = {
        'Roller Shades': [
            { id: 'v1', name: 'Cloud White', hex: '#FFFFFF', image: '/images/ai/roller_shade_white_1777429322768.png', style: 'Modern Minimalist' },
            { id: 'v2', name: 'Urban Grey', hex: '#808080', image: '/images/ai/roller_shade_grey_1777429334824.png', style: 'Industrial Loft' },
            { id: 'v3', name: 'Midnight Charcoal', hex: '#333333', image: '/images/ai/roller_shade_black_1777429348345.png', style: 'Sophisticated Dark' }
        ],
        'Zebra Shades': [
            { id: 'z1', name: 'Arctic Zebra', hex: '#FFFFFF', image: '/images/ai/zebra_shade_white_1777429360324.png', style: 'Elegant Bedroom' }
        ],
        'Glass Doors': [
            { id: 'g1', name: 'Obsidian Frame', hex: '#000000', image: '/images/ai/glass_doors_premium_1777429374604.png', style: 'Luxury Patio' }
        ],
        'Outdoor Tech': [
            { id: 'p1', name: 'Titanium Grey', hex: '#4A4A4A', image: '/images/ai/pergola_outdoor_tech_1777429388159.png', style: 'Evening Lounge' }
        ]
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate AI processing
        setTimeout(() => {
            const variations = mockAiVariations[product.category] || mockAiVariations['Roller Shades'];
            const randomVar = variations[Math.floor(Math.random() * variations.length)];
            setAiVariation(randomVar);
            setIsGenerating(false);
            setViewMode('ai');
        }, 1500);
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            marginBottom: '20px'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '15px 20px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} />
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>AI Style & Color Assistant</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => setViewMode('standard')}
                        style={{ background: viewMode === 'standard' ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                        Standard
                    </button>
                    <button 
                        onClick={() => setViewMode('ai')}
                        style={{ background: viewMode === 'ai' ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                        AI Vision
                    </button>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                {viewMode === 'standard' ? (
                    <div>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
                            Can't decide? Use our AI Assistant to visualize this product in different premium room settings and trending color palettes.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            {['Modern Minimalist', 'Japandi Style', 'Luxury Hotel', 'Industrial'].map(style => (
                                <button
                                    key={style}
                                    onClick={() => setSelectedPrompt(style)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        border: selectedPrompt === style ? '1px solid #667eea' : '1px solid #eee',
                                        background: selectedPrompt === style ? '#f0f4ff' : 'white',
                                        color: selectedPrompt === style ? '#667eea' : '#666',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                        >
                            {isGenerating ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <Wand2 size={18} />
                            )}
                            {isGenerating ? 'AI is dreaming...' : 'Visualize with AI'}
                        </button>
                    </div>
                ) : (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        {aiVariation ? (
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#f8f9fa' }}>
                                <img 
                                    src={aiVariation.image} 
                                    alt="AI Variation" 
                                    style={{ width: '100%', height: '250px', objectFit: 'cover' }} 
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '15px',
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                    color: 'white'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>AI Recommended</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>{aiVariation.name}</div>
                                            <div style={{ fontSize: '0.75rem' }}>Style: {aiVariation.style}</div>
                                        </div>
                                        <button 
                                            onClick={() => onColorSelect({ name: aiVariation.name, hex: aiVariation.hex, image: aiVariation.image })}
                                            style={{
                                                background: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '20px',
                                                padding: '8px 16px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            Apply Color <Check size={14} />
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(255,255,255,0.9)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#667eea'
                                    }}
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <RefreshCw size={48} color="#667eea" className="animate-spin" style={{ margin: '0 auto 20px' }} />
                                <p>Processing AI Visuals...</p>
                            </div>
                        )}
                        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
                            <button 
                                onClick={() => setViewMode('standard')}
                                style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}
                            >
                                ← Back to settings
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AIColorVision;
