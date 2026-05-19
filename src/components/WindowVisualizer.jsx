import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, RotateCcw, ZoomIn, ZoomOut, Camera, Wand2 } from 'lucide-react';
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

const WindowVisualizer = ({ isOpen, onClose, productTitle, selectedColor, isZebra }) => {
    const [roomPhoto, setRoomPhoto] = useState(null);
    const [opacity, setOpacity] = useState(0.82);
    const [pts, setPts] = useState([
        { x: 120, y: 40 }, // nw
        { x: 340, y: 40 }, // ne
        { x: 340, y: 380 }, // se
        { x: 120, y: 380 } // sw
    ]);
    const [drag, setDrag] = useState(null); // { type: 'move'|nw|ne|se|sw, startX, startY, origPts }
    const containerRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if (isOpen) setRoomPhoto(null);
    }, [isOpen]);

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

    const resetShade = () => setPts([{ x: 120, y: 40 }, { x: 340, y: 40 }, { x: 340, y: 380 }, { x: 120, y: 380 }]);

    const handleAutoDetect = () => {
        if (!roomPhoto || !containerRef.current) return;
        
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const w = 100;
            const h = Math.floor(100 * (img.naturalHeight / img.naturalWidth));
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;
            
            let minX = w, minY = h, maxX = 0, maxY = 0;
            let brightPixels = 0;
            let totalBrightness = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                totalBrightness += (data[i] + data[i+1] + data[i+2]) / 3;
            }
            const avgBrightness = totalBrightness / (w * h);
            const threshold = Math.max(avgBrightness * 1.5, 200);
            
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const i = (y * w + x) * 4;
                    const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
                    if (brightness > threshold) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        brightPixels++;
                    }
                }
            }
            
            if (brightPixels < 10 || maxX <= minX || maxY <= minY) {
                resetShade(); // fallback to default
                return;
            }
            
            const containerRect = containerRef.current.getBoundingClientRect();
            const imgRatio = img.naturalWidth / img.naturalHeight;
            const containerRatio = containerRect.width / containerRect.height;
            
            let renderW, renderH, offsetX = 0, offsetY = 0;
            if (imgRatio > containerRatio) {
                renderW = containerRect.width;
                renderH = containerRect.width / imgRatio;
                offsetY = (containerRect.height - renderH) / 2;
            } else {
                renderH = containerRect.height;
                renderW = containerRect.height * imgRatio;
                offsetX = (containerRect.width - renderW) / 2;
            }
            
            const scaleX = img.naturalWidth / w;
            const scaleY = img.naturalHeight / h;
            
            const finalX = offsetX + ((minX * scaleX) / img.naturalWidth) * renderW;
            const finalY = offsetY + ((minY * scaleY) / img.naturalHeight) * renderH;
            const finalW = (((maxX - minX) * scaleX) / img.naturalWidth) * renderW;
            const finalH = (((maxY - minY) * scaleY) / img.naturalHeight) * renderH;
            
            const x0 = Math.max(0, finalX);
            const y0 = Math.max(0, finalY);
            const w0 = Math.max(SHADE_MIN, finalW);
            const h0 = Math.max(SHADE_MIN, finalH);

            setPts([
                { x: x0, y: y0 },
                { x: x0 + w0, y: y0 },
                { x: x0 + w0, y: y0 + h0 },
                { x: x0, y: y0 + h0 }
            ]);
        };
        img.src = roomPhoto;
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

    const onPointerDown = useCallback((e, type) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getContainerPos(e);
        setDrag({ type, startX: pos.x, startY: pos.y, origPts: [...pts] });
    }, [pts, getContainerPos]);

    const onPointerMove = useCallback((e) => {
        if (!drag) return;
        e.preventDefault();
        const pos = getContainerPos(e);
        const dx = pos.x - drag.startX;
        const dy = pos.y - drag.startY;

        setPts(prev => {
            if (drag.type === 'move') {
                return drag.origPts.map(p => ({ x: p.x + dx, y: p.y + dy }));
            }
            const newPts = [...drag.origPts];
            if (drag.type === 'nw') newPts[0] = { x: drag.origPts[0].x + dx, y: drag.origPts[0].y + dy };
            if (drag.type === 'ne') newPts[1] = { x: drag.origPts[1].x + dx, y: drag.origPts[1].y + dy };
            if (drag.type === 'se') newPts[2] = { x: drag.origPts[2].x + dx, y: drag.origPts[2].y + dy };
            if (drag.type === 'sw') newPts[3] = { x: drag.origPts[3].x + dx, y: drag.origPts[3].y + dy };
            return newPts;
        });
    }, [drag, getContainerPos]);

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
        shadeStyle = isZebra
            ? {
                background: `repeating-linear-gradient(
                    to bottom,
                    ${shadeColor}cc 0px,
                    ${shadeColor}cc 8px,
                    ${shadeColor}22 8px,
                    ${shadeColor}22 16px
                )`,
                opacity
            }
            : {
                background: shadeColor,
                opacity: opacity * 0.7
            };
    }

    if (!isOpen) return null;

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

    const iconBtnStyle = {
        background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px', 
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        color: '#444', transition: 'background 0.2s'
    };

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
                                {/* Shade overlay */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: minX, top: minY,
                                        width: w, height: h,
                                        userSelect: 'none'
                                    }}
                                >
                                    {/* Inner Fabric Background */}
                                    <div 
                                        onMouseDown={(e) => onPointerDown(e, 'move')}
                                        onTouchStart={(e) => onPointerDown(e, 'move')}
                                        style={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                            ...shadeStyle,
                                            clipPath: clipPathStr,
                                            WebkitClipPath: clipPathStr,
                                            cursor: drag?.type === 'move' ? 'grabbing' : 'grab',
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
                                        zIndex: 2
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
                                        zIndex: 2
                                    }} />

                                    {/* 4 Corner Resize handles */}
                                    {!isTakingPhoto && [
                                        { type: 'nw', style: { top: pts[0].y - minY - 7, left: pts[0].x - minX - 7, cursor: 'nw-resize' } },
                                        { type: 'ne', style: { top: pts[1].y - minY - 7, left: pts[1].x - minX - 7, cursor: 'ne-resize' } },
                                        { type: 'se', style: { top: pts[2].y - minY - 7, left: pts[2].x - minX - 7, cursor: 'se-resize' } },
                                        { type: 'sw', style: { top: pts[3].y - minY - 7, left: pts[3].x - minX - 7, cursor: 'sw-resize' } },
                                    ].map(h => (
                                        <div
                                            key={h.type}
                                            onMouseDown={(e) => onPointerDown(e, h.type)}
                                            onTouchStart={(e) => onPointerDown(e, h.type)}
                                            style={{
                                                position: 'absolute',
                                                width: 14, height: 14,
                                                background: '#fff',
                                                border: '2px solid var(--primary-green)',
                                                borderRadius: '50%',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                zIndex: 10,
                                                ...h.style
                                            }}
                                        />
                                    ))}
                                </div>
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
                                <button title="Upload Photo" onClick={() => fileRef.current?.click()} style={iconBtnStyle} onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <Upload size={20} />
                                </button>
                                <button title="Auto-Detect Window" onClick={handleAutoDetect} style={iconBtnStyle} onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <Wand2 size={20} />
                                </button>
                                <button title="Reset Position" onClick={resetShade} style={iconBtnStyle} onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <RotateCcw size={20} />
                                </button>
                                <div style={{ width: '100%', height: '1px', background: '#eee', margin: '4px 0' }} />
                                <button title="Save Photo" onClick={handleTakePhoto} disabled={isTakingPhoto} style={{ ...iconBtnStyle, background: 'var(--primary-green)', color: '#fff', borderRadius: '50%', padding: '12px' }}>
                                    <Camera size={20} />
                                </button>
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
                                Drag the 4 corner points to fit your window exactly
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
