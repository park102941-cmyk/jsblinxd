import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

const SHADE_MIN = 60;

const WindowVisualizer = ({ isOpen, onClose, productTitle, selectedColor, isZebra }) => {
    const [roomPhoto, setRoomPhoto] = useState(null);
    const [opacity, setOpacity] = useState(0.82);
    const [shade, setShade] = useState({ x: 120, y: 40, w: 220, h: 340 });
    const [drag, setDrag] = useState(null); // { type: 'move'|corner, startX, startY, origShade }
    const containerRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if (isOpen) setRoomPhoto(null);
    }, [isOpen]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setRoomPhoto(ev.target.result);
        reader.readAsDataURL(file);
    };

    const getContainerPos = useCallback((e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    const onPointerDown = useCallback((e, type) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getContainerPos(e);
        setDrag({ type, startX: pos.x, startY: pos.y, origShade: { ...shade } });
    }, [shade, getContainerPos]);

    const onPointerMove = useCallback((e) => {
        if (!drag) return;
        e.preventDefault();
        const pos = getContainerPos(e);
        const dx = pos.x - drag.startX;
        const dy = pos.y - drag.startY;
        const orig = drag.origShade;

        setShade(prev => {
            if (drag.type === 'move') {
                return { ...prev, x: orig.x + dx, y: orig.y + dy };
            }
            if (drag.type === 'se') {
                return { ...prev, w: Math.max(SHADE_MIN, orig.w + dx), h: Math.max(SHADE_MIN, orig.h + dy) };
            }
            if (drag.type === 'sw') {
                const newW = Math.max(SHADE_MIN, orig.w - dx);
                return { ...prev, x: orig.x + orig.w - newW, w: newW, h: Math.max(SHADE_MIN, orig.h + dy) };
            }
            if (drag.type === 'ne') {
                const newH = Math.max(SHADE_MIN, orig.h - dy);
                return { ...prev, y: orig.y + orig.h - newH, w: Math.max(SHADE_MIN, orig.w + dx), h: newH };
            }
            if (drag.type === 'nw') {
                const newW = Math.max(SHADE_MIN, orig.w - dx);
                const newH = Math.max(SHADE_MIN, orig.h - dy);
                return { ...prev, x: orig.x + orig.w - newW, y: orig.y + orig.h - newH, w: newW, h: newH };
            }
            return prev;
        });
    }, [drag, getContainerPos]);

    const onPointerUp = useCallback(() => setDrag(null), []);

    const resetShade = () => setShade({ x: 120, y: 40, w: 220, h: 340 });

    const fabricImage = selectedColor?.fullImage || selectedColor?.image;
    const shadeColor = selectedColor?.hex || '#c8b89a';

    let shadeStyle = {};
    if (fabricImage) {
        shadeStyle = {
            backgroundImage: `url(${fabricImage})`,
            backgroundSize: isZebra ? '100% 180px' : 'cover', // Zebra stripes tiling or cover for roller
            backgroundPosition: 'top center',
            backgroundRepeat: isZebra ? 'repeat-y' : 'no-repeat',
            opacity: opacity
        };
    } else {
        shadeStyle = isZebra
            ? {
                background: `repeating-linear-gradient(
                    to bottom,
                    ${shadeColor}cc 0px,
                    ${shadeColor}cc 18px,
                    ${shadeColor}22 18px,
                    ${shadeColor}22 36px
                )`,
                opacity
            }
            : {
                background: shadeColor,
                opacity: opacity * 0.7
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
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Try in My Window</h2>
                        <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#888' }}>
                            {productTitle}{selectedColor ? ` — ${selectedColor.name}` : ''}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={22} color="#555" />
                    </button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
                    {/* Canvas area */}
                    <div style={{ flex: 1, position: 'relative', background: '#1a1a1a', overflow: 'hidden', minHeight: '400px' }}
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
                                {/* Shade overlay */}
                                <div
                                    onMouseDown={(e) => onPointerDown(e, 'move')}
                                    onTouchStart={(e) => onPointerDown(e, 'move')}
                                    style={{
                                        position: 'absolute',
                                        left: shade.x, top: shade.y,
                                        width: shade.w, height: shade.h,
                                        ...shadeStyle,
                                        cursor: drag?.type === 'move' ? 'grabbing' : 'grab',
                                        borderRadius: '2px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                        userSelect: 'none',
                                        border: '2px solid rgba(255,255,255,0.4)'
                                    }}
                                >
                                    {/* Resize handles */}
                                    {[
                                        { type: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
                                        { type: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
                                        { type: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
                                        { type: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
                                    ].map(h => (
                                        <div
                                            key={h.type}
                                            onMouseDown={(e) => onPointerDown(e, h.type)}
                                            onTouchStart={(e) => onPointerDown(e, h.type)}
                                            style={{
                                                position: 'absolute',
                                                width: 12, height: 12,
                                                background: '#fff',
                                                border: '2px solid #555',
                                                borderRadius: '2px',
                                                ...h.style
                                            }}
                                        />
                                    ))}

                                    {/* Move indicator */}
                                    <div style={{
                                        position: 'absolute', top: '50%', left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        background: 'rgba(0,0,0,0.35)', borderRadius: '6px',
                                        padding: '4px 10px', color: '#fff', fontSize: '0.7rem',
                                        fontWeight: '600', pointerEvents: 'none', whiteSpace: 'nowrap'
                                    }}>
                                        Drag to Move · Edges to Resize
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div
                                onClick={() => fileRef.current?.click()}
                                style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', gap: '12px'
                                }}
                            >
                                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Upload size={28} color="#fff" />
                                </div>
                                <p style={{ color: '#bbb', fontSize: '0.95rem', textAlign: 'center', margin: 0 }}>
                                    Upload a photo of your window or room<br />
                                    <span style={{ fontSize: '0.78rem', color: '#777' }}>Click here or browse your files</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div style={{ width: '220px', padding: '20px', borderLeft: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Upload Photo
                            </div>
                            <button
                                onClick={() => fileRef.current?.click()}
                                style={{ width: '100%', padding: '10px', border: '1.5px dashed #ccc', borderRadius: '8px', background: '#fafafa', cursor: 'pointer', fontSize: '0.85rem', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <Upload size={14} /> Select Photo
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                        </div>

                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Shade Color
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '6px', background: fabricImage ? `url(${fabricImage}) center/cover` : shadeColor, border: '1px solid #ddd', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.82rem', color: '#555' }}>{selectedColor?.name || 'Default Color'}</span>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opacity</div>
                                <span style={{ fontSize: '0.78rem', color: '#888' }}>{Math.round(opacity * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0.2" max="1" step="0.05"
                                value={opacity}
                                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--primary-green)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#aaa', marginTop: '2px' }}>
                                <ZoomOut size={10} />
                                <ZoomIn size={10} />
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Size & Position
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: '1.5', marginBottom: '10px' }}>
                                W: {Math.round(shade.w)}px · H: {Math.round(shade.h)}px
                            </div>
                            <button
                                onClick={resetShade}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            >
                                <RotateCcw size={12} /> Reset Position
                            </button>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <div style={{ fontSize: '0.72rem', color: '#aaa', lineHeight: '1.5', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
                                💡 Photos are processed locally in your browser and are not saved to our servers.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WindowVisualizer;
