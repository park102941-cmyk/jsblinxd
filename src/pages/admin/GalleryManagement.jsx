import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Image as ImageIcon, ExternalLink, RefreshCw, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

const GALLERY_CATEGORIES = [
  { id: 'light-zebra', name: 'Zebra (Light Filter)' },
  { id: 'blackout-zebra', name: 'Zebra (Blackout)' },
  { id: 'light-roller', name: 'Roller (Light Filter)' },
  { id: 'blackout-roller', name: 'Roller (Blackout)' },
  { id: 'smart-device', name: 'Smart Device' }
];

const GalleryManagement = () => {
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [galleryItems, setGalleryItems] = useState([]);
    const [galleryFilter, setGalleryFilter] = useState('all');
    const [newItem, setNewItem] = useState({
        title: '',
        desc: '',
        image: '',
        category: 'blackout-zebra',
        link: '/products?category=zebra&opacity=blackout'
    });

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        setSyncing(true);
        try {
            const querySnapshot = await getDocs(collection(db, "gallery_items"));
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by createdAt descending if present
            items.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            });
            setGalleryItems(items);
        } catch (error) {
            console.error("Error fetching gallery items:", error);
        } finally {
            setSyncing(false);
        }
    };

    const handleCategoryChange = (catId) => {
        let defaultLink = '/products';
        if (catId === 'light-zebra') defaultLink = '/products?category=zebra&opacity=light-filtering';
        else if (catId === 'blackout-zebra') defaultLink = '/products?category=zebra&opacity=blackout';
        else if (catId === 'light-roller') defaultLink = '/products?category=roller&opacity=light-filtering';
        else if (catId === 'blackout-roller') defaultLink = '/products?category=roller&opacity=blackout';
        else if (catId === 'smart-device') defaultLink = '/products?category=motor';

        setNewItem(prev => ({
            ...prev,
            category: catId,
            link: defaultLink
        }));
    };

    const handleAddGalleryItem = async (e) => {
        e.preventDefault();
        if (!newItem.title || !newItem.image) {
            alert("제목과 업로드할 이미지가 꼭 필요합니다.");
            return;
        }

        setLoading(true);
        try {
            const docData = {
                title: newItem.title,
                desc: newItem.desc,
                image: newItem.image,
                category: newItem.category,
                link: newItem.link,
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, "gallery_items"), docData);
            
            // Update local state instantly at the beginning of the list
            setGalleryItems(prev => [{ id: docRef.id, ...docData }, ...prev]);
            
            // Reset form
            setNewItem({
                title: '',
                desc: '',
                image: '',
                category: 'blackout-zebra',
                link: '/products?category=zebra&opacity=blackout'
            });
            alert("성공적으로 새로운 룩북 시공 사진이 추가되었습니다! 🖼️");
        } catch (error) {
            console.error("Error adding gallery item:", error);
            alert("사진 등록 실패: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGalleryItem = async (id) => {
        if (!window.confirm("정말로 이 시공 사진을 룩북 갤러리에서 삭제하시겠습니까?")) {
            return;
        }

        setLoading(true);
        console.log("Attempting to delete lookbook item from Firestore with ID:", id);
        try {
            const docRef = doc(db, "gallery_items", id);
            await deleteDoc(docRef);
            
            console.log("Successfully deleted document from Firestore collection 'gallery_items' with ID:", id);
            setGalleryItems(prev => prev.filter(item => item.id !== id));
            alert("삭제 완료되었습니다! 🖼️");
        } catch (error) {
            console.error("CRITICAL LOOKBOOK DELETE ERROR:", error);
            alert(`시공 사진 삭제 실패!\n\n오류 코드: ${error.code || 'Unknown'}\n오류 메시지: ${error.message}\n\n💡 도움말: Firestore 보안 규칙(Rules)에서 'gallery_items' 컬렉션의 'delete' 권한이 허용되어 있는지 확인해 주세요. (예: allow delete: if true;)`);
        } finally {
            setLoading(false);
        }
    };

    const filteredGalleryItems = galleryFilter === 'all' 
        ? galleryItems 
        : galleryItems.filter(item => item.category === galleryFilter);

    return (
        <div style={{ padding: '10px' }}>
            {/* Header Title Banner */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                borderBottom: '2px solid #f1f3f5',
                paddingBottom: '20px'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1d1d1f', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={26} color="var(--secondary-olive)" />
                        갤러리 업로드 및 관리 전용 콘솔 (Lookbook)
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#86868b', margin: '5px 0 0 0' }}>
                        웹사이트의 /galleryLookbook 및 각 상품 하단 참조 갤러리에 노출되는 설치 시공 고화질 레퍼런스 사진들을 등록/삭제합니다.
                    </p>
                </div>
                <button 
                    onClick={fetchGallery}
                    disabled={syncing}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 20px',
                        background: '#f5f5f7',
                        border: '1px solid #d2d2d7',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                        color: '#1d1d1f'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e8e8ed'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f7'}
                >
                    <RefreshCw size={14} className={syncing ? 'spin' : ''} />
                    {syncing ? '동기화 중...' : '데이터 동기화'}
                </button>
            </div>

            {/* Split Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* Dedicated Add / Upload Form (Left Column) */}
                <div style={{ 
                    background: 'white', 
                    padding: '30px', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
                }}>
                    <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '700', 
                        marginBottom: '25px', 
                        color: '#1d1d1f', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        borderBottom: '1px solid #f1f3f5',
                        paddingBottom: '15px'
                    }}>
                        <ImageIcon size={22} color="var(--primary-green)" />
                        신규 시공 사진 등록
                    </h3>

                    <form onSubmit={handleAddGalleryItem}>
                        {/* Title */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#4b5563' }}>
                                시공 현장 제목 *
                            </label>
                            <input 
                                type="text"
                                required
                                value={newItem.title}
                                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="예: 거실 지브라 암막 차콜 시공 현장"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    border: '1px solid #cbd5e1', 
                                    borderRadius: '8px', 
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#4b5563' }}>
                                현장 상세 설명 (선택)
                            </label>
                            <textarea 
                                value={newItem.desc}
                                onChange={(e) => setNewItem(prev => ({ ...prev, desc: e.target.value }))}
                                placeholder="사용된 원단명, 시공 특징, 채광 조절 등 현장 관련 메모를 남겨주세요."
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    border: '1px solid #cbd5e1', 
                                    borderRadius: '8px', 
                                    minHeight: '80px', 
                                    fontSize: '0.85rem',
                                    resize: 'vertical',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>

                        {/* Category Dropdown Selection */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#4b5563' }}>
                                제품 카테고리 지정 *
                            </label>
                            <select 
                                value={newItem.category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    border: '1px solid #cbd5e1', 
                                    borderRadius: '8px', 
                                    fontSize: '0.9rem', 
                                    background: 'white',
                                    outline: 'none'
                                }}
                            >
                                {GALLERY_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Redirect Action Link (Auto-populated with Helper) */}
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#4b5563' }}>
                                구매 연결 링크 (Shop This Look) *
                            </label>
                            <input 
                                type="text"
                                required
                                value={newItem.link}
                                onChange={(e) => setNewItem(prev => ({ ...prev, link: e.target.value }))}
                                placeholder="/products?category=..."
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    border: '1px solid #cbd5e1', 
                                    borderRadius: '8px', 
                                    fontSize: '0.85rem', 
                                    fontFamily: 'monospace',
                                    background: '#f8fafc',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '6px', lineHeight: '1.4' }}>
                                💡 카테고리 지정 시 해당 쇼핑 필터 링크가 자동으로 생성됩니다. 변경을 원하시면 직접 수정하실 수 있습니다.
                            </span>
                        </div>

                        {/* Cloudinary Image Picker Section */}
                        <div style={{ marginBottom: '30px' }}>
                            <ImageUploader 
                                onUploadComplete={(url) => setNewItem(prev => ({ ...prev, image: url }))}
                                currentImageUrl={newItem.image}
                                label="시공 원본 사진 업로드 (Cloudinary 고속 서버 전송) *"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={loading || !newItem.image}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: loading || !newItem.image ? '#94a3b8' : 'var(--primary-green)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                cursor: loading || !newItem.image ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(107, 116, 103, 0.2)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? (
                                <Loader2 className="spin" size={18} />
                            ) : (
                                <Plus size={18} />
                            )}
                            {loading ? '업로드 등록 중...' : '갤러리 시공 사진 등록하기'}
                        </button>
                    </form>
                </div>

                {/* Live Lookbook Grid List (Right Column) */}
                <div style={{ 
                    background: 'white', 
                    padding: '30px', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                    minHeight: '500px'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '25px', 
                        flexWrap: 'wrap', 
                        gap: '15px',
                        borderBottom: '1px solid #f1f3f5',
                        paddingBottom: '15px'
                    }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1d1d1f', margin: 0 }}>
                            전체 등록된 사진 목록 ({filteredGalleryItems.length}개)
                        </h3>
                        
                        <select 
                            value={galleryFilter}
                            onChange={(e) => setGalleryFilter(e.target.value)}
                            style={{ 
                                padding: '10px 16px', 
                                border: '1px solid #cbd5e1', 
                                borderRadius: '8px', 
                                fontSize: '0.85rem', 
                                background: 'white',
                                outline: 'none'
                            }}
                        >
                            <option value="all">전체 카테고리 보기</option>
                            {GALLERY_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {filteredGalleryItems.length === 0 ? (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            height: '350px', 
                            border: '2px dashed #cbd5e1', 
                            borderRadius: '12px', 
                            color: '#94a3b8',
                            background: '#f8fafc'
                        }}>
                            <ImageIcon size={42} style={{ marginBottom: '15px', opacity: 0.6 }} />
                            <p style={{ fontSize: '0.95rem', fontWeight: '600' }}>해당 카테고리에 등록된 시공 사진이 존재하지 않습니다.</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>왼쪽 폼에서 고화질 사진을 업로드해 보세요.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '20px' }}>
                            {filteredGalleryItems.map(item => (
                                <div 
                                    key={item.id}
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        background: '#fff',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01)',
                                        position: 'relative',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Image Frame */}
                                    <div style={{ position: 'relative', width: '100%', paddingTop: '80%', background: '#f1f5f9' }}>
                                        <img 
                                            src={item.image} 
                                            alt={item.title} 
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>

                                    {/* Item Meta info */}
                                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            fontWeight: '700', 
                                            color: 'var(--primary-green)', 
                                            textTransform: 'uppercase', 
                                            marginBottom: '6px', 
                                            display: 'block' 
                                        }}>
                                            {GALLERY_CATEGORIES.find(c => c.id === item.category)?.name || item.category}
                                        </span>
                                        <h4 style={{ 
                                            fontSize: '0.9rem', 
                                            fontWeight: '800', 
                                            margin: '0 0 8px 0', 
                                            color: '#1d1d1f', 
                                            display: '-webkit-box', 
                                            WebkitLineClamp: 1, 
                                            WebkitBoxOrient: 'vertical', 
                                            overflow: 'hidden' 
                                        }}>
                                            {item.title}
                                        </h4>
                                        <p style={{ 
                                            fontSize: '0.8rem', 
                                            color: '#64748b', 
                                            margin: '0 0 16px 0', 
                                            flex: 1, 
                                            display: '-webkit-box', 
                                            WebkitLineClamp: 2, 
                                            WebkitBoxOrient: 'vertical', 
                                            overflow: 'hidden',
                                            lineHeight: '1.4'
                                        }}>
                                            {item.desc || '등록된 상세 설명이 없습니다.'}
                                        </p>

                                        {/* Actions */}
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            marginTop: 'auto',
                                            borderTop: '1px solid #f1f3f5',
                                            paddingTop: '12px'
                                        }}>
                                            <a 
                                                href={item.link} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '4px', 
                                                    fontSize: '0.75rem', 
                                                    color: '#3b82f6', 
                                                    textDecoration: 'none',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <ExternalLink size={11} />
                                                연결 상품 보기
                                            </a>
                                            <button
                                                onClick={() => handleDeleteGalleryItem(item.id)}
                                                disabled={loading}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    padding: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '6px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                `}
            </style>
        </div>
    );
};

export default GalleryManagement;
