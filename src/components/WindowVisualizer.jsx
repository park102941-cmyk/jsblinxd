import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, RotateCcw, Camera, Plus, Maximize, Focus } from 'lucide-react';
import html2canvas from 'html2canvas';

const SHADE_MIN = 60;

const hexToRgb = (hex) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
};

const getMatchedCassetteColor = (hexColor) => {
    if (!hexColor) return { top: '#fcfcfc', bottom: '#d0d0d0' };
    
    try {
        const target = hexToRgb(hexColor);
        const cassettes = [
            { name: 'White', rgb: [255, 255, 255], top: '#ffffff', bottom: '#e0e0e0' },
            { name: 'Ivory', rgb: [255, 253, 230], top: '#ffffe6', bottom: '#e6e6c8' },
            { name: 'Beige', rgb: [222, 203, 174], top: '#e2d3be', bottom: '#c8b49b' },
            { name: 'Grey', rgb: [160, 160, 160], top: '#a8a8a8', bottom: '#787878' },
            { name: 'Brown', rgb: [101, 67, 33], top: '#7d5635', bottom: '#4d321c' },
            { name: 'Black', rgb: [40, 40, 40], top: '#3c3c3c', bottom: '#1a1a1a' }
        ];

        let bestMatch = cassettes[0];
        let minDistance = Infinity;

        for (const c of cassettes) {
            const dist = Math.sqrt(
                Math.pow(target[0] - c.rgb[0], 2) +
                Math.pow(target[1] - c.rgb[1], 2) +
                Math.pow(target[2] - c.rgb[2], 2)
            );
            if (dist < minDistance) {
                minDistance = dist;
                bestMatch = c;
            }
        }
        return bestMatch;
    } catch (e) {
        return { top: '#fcfcfc', bottom: '#d0d0d0' };
    }
};

const ToolbarButton = ({ icon: Icon, label, onClick, isActive, disabled, hoveredIcon, setHoveredIcon, customStyle }) => {
    return (
        <div style={{ position: 'relative' }} onMouseEnter={() => setHoveredIcon(label)} onMouseLeave={() => setHoveredIcon(null)}>
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                style={customStyle || {
                    background: isActive ? 'rgba(0,0,0,0.08)' : 'transparent',
                    border: 'none', cursor: 'pointer', padding: '10px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? 'var(--primary-green)' : '#444',
                    transition: 'background 0.2s',
                    opacity: disabled ? 0.5 : 1
                }}
                onMouseOver={(e) => !customStyle && !isActive && !disabled && (e.currentTarget.style.background = '#f0f0f0')}
                onMouseOut={(e) => !customStyle && !isActive && !disabled && (e.currentTarget.style.background = 'transparent')}
            >
                <Icon size={20} />
            </button>
            {hoveredIcon === label && !disabled && (
                <div style={{
                    position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
                    marginRight: '12px', background: 'rgba(0,0,0,0.75)', color: '#fff',
                    padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '500',
                    whiteSpace: 'nowrap', pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 100
                }}>
                    {label}
                    <div style={{
                        position: 'absolute', right: '-4px', top: '50%', transform: 'translateY(-50%)',
                        width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent',
                        borderLeft: '4px solid rgba(0,0,0,0.75)'
                    }} />
                </div>
            )}
        </div>
    );
};

const WindowVisualizer = ({ isOpen, onClose, productTitle, selectedColor, isZebra }) => {
    const isBlackout = productTitle?.toLowerCase().includes('blackout');
    
    const [roomPhoto, setRoomPhoto] = useState(null);
    const [opacity, setOpacity] = useState(isBlackout ? 1.0 : 0.82);
    
    const [editMode, setEditMode] = useState('scale'); // 'scale' or 'perspective'
    const [hoveredIcon, setHoveredIcon] = useState(null);
    
    const defaultPts = [
        { x: 120, y: 40 }, // nw
        { x: 340, y: 40 }, // ne
        { x: 340, y: 380 }, // se
        { x: 120, y: 380 } // sw
    ];
    
    const [shades, setShades] = useState([defaultPts]);
    const [drag, setDrag] = useState(null); // { shadeIndex, type, startX, startY, origPts }
    const containerRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setRoomPhoto(null);
            setOpacity(isBlackout ? 1.0 : 0.82);
        }
    }, [isOpen, isBlackout]);

    const [fabricDataUrl, setFabricDataUrl] = useState(null);

    useEffect(() => {
        const url = selectedColor?.fullImage || selectedColor?.image;
        if (!url) {
            setFabricDataUrl(null);
            return;
        }
        
        if (url.startsWith('data:')) {
            setFabricDataUrl(url);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                setFabricDataUrl(canvas.toDataURL('image/png'));
            } catch (e) {
                console.error("CORS error converting fabric image to base64", e);
                setFabricDataUrl(null);
            }
        };
        img.onerror = () => {
            console.error("Error loading fabric image for base64 conversion");
            setFabricDataUrl(null);
        };
        img.src = url;
    }, [selectedColor]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setRoomPhoto(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const resetShade = () => setShades([defaultPts]);

    const handleAddShade = () => {
        setShades(prev => {
            const offset = prev.length * 20;
            return [
                ...prev,
                [
                    { x: 120 + offset, y: 40 + offset },
                    { x: 340 + offset, y: 40 + offset },
                    { x: 340 + offset, y: 380 + offset },
                    { x: 120 + offset, y: 380 + offset }
                ]
            ];
        });
    };

    const handleDeleteShade = (indexToRemove) => {
        setShades(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const [isTakingPhoto, setIsTakingPhoto] = useState(false);
    const handleTakePhoto = async () => {
        if (!containerRef.current) return;
        setIsTakingPhoto(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            const canvas = await html2canvas(containerRef.current, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#1a1a1a'
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `jsblind-preview-${new Date().getTime()}.png`;
            link.click();
        } catch (err) {
            console.error("Failed to capture photo", err);
            alert("Failed to capture photo. Please check your image format or try again.");
        } finally {
            setIsTakingPhoto(false);
        }
    };

    const getContainerPos = useCallback((e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    const onPointerDown = useCallback((e, shadeIndex, type) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getContainerPos(e);
        setDrag({ shadeIndex, type, startX: pos.x, startY: pos.y, origPts: [...shades[shadeIndex]] });
    }, [shades, getContainerPos]);

    const onPointerMove = useCallback((e) => {
        if (!drag) return;
        e.preventDefault();
        const pos = getContainerPos(e);
        const dx = pos.x - drag.startX;
        const dy = pos.y - drag.startY;

        setShades(prev => {
            const newShades = [...prev];
            const origPts = drag.origPts;
            let newPts = [...origPts];
            
            if (drag.type === 'move') {
                newPts = origPts.map(p => ({ x: p.x + dx, y: p.y + dy }));
            } else {
                const cornerMap = { 'nw': 0, 'ne': 1, 'se': 2, 'sw': 3 };
                const dragIndex = cornerMap[drag.type];
                
                if (editMode === 'perspective') {
                    newPts[dragIndex] = { x: origPts[dragIndex].x + dx, y: origPts[dragIndex].y + dy };
                } else if (editMode === 'scale') {
                    const oppIndex = (dragIndex + 2) % 4;
                    const origin = origPts[oppIndex];
                    const origW = origPts[dragIndex].x - origin.x;
                    const origH = origPts[dragIndex].y - origin.y;
                    
                    let scaleX = Math.abs(origW) > 0.1 ? (origW + dx) / origW : 1;
                    let scaleY = Math.abs(origH) > 0.1 ? (origH + dy) / origH : 1;
                    
                    if (scaleX * Math.abs(origW) < 20) scaleX = 20 / Math.abs(origW);
                    if (scaleY * Math.abs(origH) < 20) scaleY = 20 / Math.abs(origH);

                    for (let i = 0; i < 4; i++) {
                        newPts[i] = {
                            x: origin.x + (origPts[i].x - origin.x) * scaleX,
                            y: origin.y + (origPts[i].y - origin.y) * scaleY
                        };
                    }
                }
            }
            newShades[drag.shadeIndex] = newPts;
            return newShades;
        });
    }, [drag, editMode, getContainerPos]);

    const onPointerUp = useCallback(() => setDrag(null), []);

    const fabricImage = fabricDataUrl || selectedColor?.fullImage || selectedColor?.image;
    const shadeColor = selectedColor?.hex || '#c8b89a';
    const cassetteColors = getMatchedCassetteColor(shadeColor);

    let shadeStyle = {};
    if (fabricImage) {
        shadeStyle = {
            backgroundImage: `url(${fabricImage})`,
            backgroundSize: isZebra ? '100% 36px' : 'cover', // Zebra stripes tiling or cover for roller
            backgroundPosition: 'top center',
            backgroundRepeat: isZebra ? 'repeat-y' : 'no-repeat',
            opacity: opacity
        };
    } else {
        const solidAlpha = isBlackout ? 'ff' : 'cc';
        shadeStyle = isZebra
            ? {
                background: `repeating-linear-gradient(
                    to bottom,
                    ${shadeColor}${solidAlpha} 0px,
                    ${shadeColor}${solidAlpha} 8px,
                    ${shadeColor}22 8px,
                    ${shadeColor}22 16px
                )`,
                opacity
            }
            : {
                background: shadeColor,
                opacity: isBlackout ? opacity : opacity * 0.7
            };
    }

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '900px',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '6px', background: fabricImage ? `url(${fabricImage}) center/cover` : shadeColor, border: '1px solid #ddd', flexShrink: 0 }} />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#222' }}>Try in My Window</h2>
                            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#777' }}>
                                {productTitle}{selectedColor ? ` — ${selectedColor.name}` : ''}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}>
                        <X size={20} color="#555" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px', background: '#1a1a1a' }}>
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
                        ref={containerRef}
                        onMouseMove={onPointerMove}
                        onMouseUp={onPointerUp}
                        onMouseLeave={onPointerUp}
                        onTouchMove={onPointerMove}
                        onTouchEnd={onPointerUp}
                    >
                        {roomPhoto ? (
                            <>
                                <img
                                    src={roomPhoto}
                                    alt="Room"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }}
                                    draggable={false}
                                />
                                {/* Shade overlays */}
                                {shades.map((pts, index) => {
                                    const minX = Math.min(...pts.map(p => p.x));
                                    const maxX = Math.max(...pts.map(p => p.x));
                                    const minY = Math.min(...pts.map(p => p.y));
                                    const maxY = Math.max(...pts.map(p => p.y));
                                    const w = Math.max(10, maxX - minX);
                                    const h = Math.max(10, maxY - minY);

                                    const clipPathStr = `polygon(${pts.map(p => `${p.x - minX}px ${p.y - minY}px`).join(', ')})`;

                                    const topAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
                                    const topWidth = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);

                                    const bottomAngle = Math.atan2(pts[2].y - pts[3].y, pts[2].x - pts[3].x);
                                    const bottomWidth = Math.hypot(pts[2].x - pts[3].x, pts[2].y - pts[3].y);

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                position: 'absolute',
                                                left: minX, top: minY,
                                                width: w, height: h,
                                                userSelect: 'none'
                                            }}
                                        >
                                            {/* Inner Fabric Background */}
                                            <div 
                                                onMouseDown={(e) => onPointerDown(e, index, 'move')}
                                                onTouchStart={(e) => onPointerDown(e, index, 'move')}
                                                style={{
                                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                    ...shadeStyle,
                                                    clipPath: clipPathStr,
                                                    WebkitClipPath: clipPathStr,
                                                    cursor: drag?.type === 'move' && drag.shadeIndex === index ? 'grabbing' : 'grab',
                                                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                                                }} 
                                            />
                                            
                                            {/* Top Cassette */}
                                            <div style={{
                                                position: 'absolute', 
                                                left: pts[0].x - minX, 
                                                top: pts[0].y - minY, 
                                                width: topWidth, 
                                                height: '16px',
                                                transformOrigin: 'top left',
                                                transform: `rotate(${topAngle}rad)`,
                                                background: `linear-gradient(to bottom, ${cassetteColors.top}, ${cassetteColors.bottom})`,
                                                borderBottom: '1px solid rgba(0,0,0,0.2)',
                                                borderTopLeftRadius: '2px', borderTopRightRadius: '2px',
                                                zIndex: 2,
                                                opacity: isZebra ? 1 : opacity
                                            }} />

                                            {/* Bottom Bar */}
                                            <div style={{
                                                position: 'absolute', 
                                                left: pts[3].x - minX, 
                                                top: pts[3].y - minY, 
                                                width: bottomWidth, 
                                                height: '8px',
                                                transformOrigin: 'top left',
                                                transform: `rotate(${bottomAngle}rad) translateY(-100%)`,
                                                background: `linear-gradient(to bottom, ${cassetteColors.top}, ${cassetteColors.bottom})`,
                                                borderTop: '1px solid rgba(0,0,0,0.2)',
                                                borderBottomLeftRadius: '2px', borderBottomRightRadius: '2px',
                                                zIndex: 2,
                                                opacity: isZebra ? 1 : opacity
                                            }} />

                                            {/* 4 Corner Resize handles */}
                                            {!isTakingPhoto && [
                                                { type: 'nw', style: { top: pts[0].y - minY - 7, left: pts[0].x - minX - 7, cursor: editMode === 'scale' ? 'nw-resize' : 'pointer' } },
                                                { type: 'ne', style: { top: pts[1].y - minY - 7, left: pts[1].x - minX - 7, cursor: editMode === 'scale' ? 'ne-resize' : 'pointer' } },
                                                { type: 'se', style: { top: pts[2].y - minY - 7, left: pts[2].x - minX - 7, cursor: editMode === 'scale' ? 'se-resize' : 'pointer' } },
                                                { type: 'sw', style: { top: pts[3].y - minY - 7, left: pts[3].x - minX - 7, cursor: editMode === 'scale' ? 'sw-resize' : 'pointer' } },
                                            ].map(h => (
                                                <div
                                                    key={h.type}
                                                    onMouseDown={(e) => onPointerDown(e, index, h.type)}
                                                    onTouchStart={(e) => onPointerDown(e, index, h.type)}
                                                    style={{
                                                        position: 'absolute',
                                                        width: 14, height: 14,
                                                        background: '#fff',
                                                        border: `2px solid ${editMode === 'scale' ? 'var(--primary-green)' : '#ff9800'}`,
                                                        borderRadius: '50%',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                        zIndex: 10,
                                                        ...h.style
                                                    }}
                                                />
                                            ))}

                                            {/* Delete Button (Only if there are multiple shades) */}
                                            {!isTakingPhoto && shades.length > 1 && (
                                                <div
                                                    onMouseDown={(e) => { e.stopPropagation(); handleDeleteShade(index); }}
                                                    onTouchStart={(e) => { e.stopPropagation(); handleDeleteShade(index); }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: pts[1].y - minY - 15,
                                                        left: pts[1].x - minX + 5,
                                                        width: 20, height: 20,
                                                        background: '#ff4d4f', color: '#fff',
                                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', zIndex: 11,
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    <X size={12} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', gap: '16px'
                                }}
                            >
                                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Upload size={32} color="#fff" />
                                </div>
                                <p style={{ color: '#bbb', fontSize: '1.05rem', textAlign: 'center', margin: 0, fontWeight: '500' }}>
                                    Upload a photo of your window or room<br />
                                    <span style={{ fontSize: '0.85rem', color: '#777', fontWeight: 'normal', marginTop: '8px', display: 'inline-block' }}>Click here or browse your files</span>
                                </p>
                            </div>
                        )}

                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

                        {/* Floating Icon Toolbar */}
                        {roomPhoto && !isTakingPhoto && (
                            <div style={{
                                position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                                display: 'flex', flexDirection: 'column', gap: 10,
                                background: 'rgba(255,255,255,0.95)', padding: '10px 8px',
                                borderRadius: 30, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 10
                            }}>
                                <ToolbarButton icon={Upload} label="Upload Photo" onClick={() => fileRef.current?.click()} hoveredIcon={hoveredIcon} setHoveredIcon={setHoveredIcon} />
                                <ToolbarButton icon={Plus} label="Add Window" onClick={handleAddShade} hoveredIcon={hoveredIcon} setHoveredIcon={setHoveredIcon} />
                                
                                <div style={{ width: '100%', height: '1px', background: '#eee', margin: '4px 0' }} />
                                
                                <ToolbarButton icon={Maximize} label="Resize Window" onClick={() => setEditMode('scale')} isActive={editMode === 'scale'} hoveredIcon={hoveredIcon} setHoveredIcon={setHoveredIcon} />
                                <ToolbarButton icon={Focus} label="Adjust Corners" onClick={() => setEditMode('perspective')} isActive={editMode === 'perspective'} hoveredIcon={hoveredIcon} setHoveredIcon={setHoveredIcon} />
                                
                                <div style={{ width: '100%', height: '1px', background: '#eee', margin: '4px 0' }} />

                                <ToolbarButton icon={RotateCcw} label="Reset Position" onClick={resetShade} hoveredIcon={hoveredIcon} setHoveredIcon={setHoveredIcon} />
                                
                                <ToolbarButton 
                                    icon={Camera} 
                                    label="Save Photo" 
                                    onClick={handleTakePhoto} 
                                    disabled={isTakingPhoto} 
                                    hoveredIcon={hoveredIcon} 
                                    setHoveredIcon={setHoveredIcon}
                                    customStyle={{
                                        background: 'var(--primary-green)', border: 'none', cursor: 'pointer', padding: '12px',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', transition: 'background 0.2s', opacity: isTakingPhoto ? 0.5 : 1
                                    }}
                                />
                            </div>
                        )}
                        
                        {/* Instructional Tooltip */}
                        {roomPhoto && !isTakingPhoto && (
                            <div style={{
                                position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 16px',
                                borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500', pointerEvents: 'none',
                                backdropFilter: 'blur(4px)'
                            }}>
                                {editMode === 'scale' ? "Drag corners to resize the window uniformly" : "Drag corners to adjust window perspective"}
                            </div>
                        )}
                    </div>

                    {/* Disclaimer and Opacity Footer */}
                    <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                        <div style={{ flex: 1, fontSize: '0.8rem', color: '#888', fontStyle: 'italic', lineHeight: '1.4' }}>
                            <span style={{ fontWeight: '600', color: '#666', fontStyle: 'normal' }}>Disclaimer:</span> This is a simulation for visualization purposes. The actual product appearance, fit, color, and texture may differ from this generated image.
                        </div>
                        {roomPhoto && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px', background: '#f9f9f9', padding: '8px 16px', borderRadius: '30px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opacity</span>
                                <input 
                                    type="range" min="0.2" max="1" step="0.05" 
                                    value={opacity} 
                                    onChange={(e) => setOpacity(parseFloat(e.target.value))} 
                                    style={{ flex: 1, accentColor: 'var(--primary-green)' }} 
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WindowVisualizer;
