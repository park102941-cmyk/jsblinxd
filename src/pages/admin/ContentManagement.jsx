import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { Save, Loader, Trash2, Plus, Image as ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';

const GALLERY_CATEGORIES = [
  { id: 'light-zebra', name: 'Zebra (Light Filter)' },
  { id: 'blackout-zebra', name: 'Zebra (Blackout)' },
  { id: 'light-roller', name: 'Roller (Light Filter)' },
  { id: 'blackout-roller', name: 'Roller (Blackout)' },
  { id: 'smart-device', name: 'Smart Device' }
];

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState('about'); // 'about', 'faq', or 'lookbook'
    const [loading, setLoading] = useState(false);

    // About Us State
    const [aboutData, setAboutData] = useState({
        heroTitle: 'WHY JSBlind',
        heroSubtitle: 'Innovating window treatments for the modern smart home.',
        introTitle: 'Technology Meets Craftsmanship',
        introText: 'At JSBlind, we believe your window treatments should do more than just block light. They should integrate seamlessly into your life, offering convenience, style, and energy efficiency. Our mission is to bring premium, custom-fit smart blinds to every home without the premium markup.'
    });

    // FAQ State
    const [faqs, setFaqs] = useState([
        { question: '', answer: '' }
    ]);

    // Lookbook State
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
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            // Fetch About Us
            const aboutDoc = await getDoc(doc(db, "content_pages", "about_us"));
            if (aboutDoc.exists()) {
                setAboutData(aboutDoc.data());
            }

            // Fetch FAQ
            const faqDoc = await getDoc(doc(db, "content_pages", "faq"));
            if (faqDoc.exists()) {
                setFaqs(faqDoc.data().items || []);
            } else {
                // Default FAQs if none exist
                setFaqs([
                    {
                        question: "How do I measure my windows?",
                        answer: "We have a comprehensive measurement guide available on our website. Generally, you'll need to measure the width and height of your window frame at three different points (top, middle, bottom for width; left, center, right for height) and use the smallest width and longest height for inside mounts."
                    },
                    {
                        question: "What is the difference between single and multi-channel remotes?",
                        answer: "A single-channel remote controls one blind or a group of blinds simultaneously. A multi-channel remote (e.g., 2, 6, or 15 channels) allows you to control multiple blinds individually or in groups using a single remote control."
                    }
                ]);
            }

            // Fetch Gallery Items
            const querySnapshot = await getDocs(collection(db, "gallery_items"));
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGalleryItems(items);
        } catch (error) {
            console.error("Error fetching content:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAboutSave = async () => {
        setLoading(true);
        try {
            await setDoc(doc(db, "content_pages", "about_us"), aboutData);
            alert("About Us content updated successfully!");
        } catch (error) {
            console.error("Error saving About Us:", error);
            alert("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const handleFaqSave = async () => {
        setLoading(true);
        try {
            await setDoc(doc(db, "content_pages", "faq"), { items: faqs });
            alert("FAQs updated successfully!");
        } catch (error) {
            console.error("Error saving FAQs:", error);
            alert("Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    const handleFaqChange = (index, field, value) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    };

    const addFaq = () => {
        setFaqs([...faqs, { question: '', answer: '' }]);
    };

    const removeFaq = (index) => {
        const newFaqs = faqs.filter((_, i) => i !== index);
        setFaqs(newFaqs);
    };

    // Lookbook Actions
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 900 * 1024) {
            alert("Notice: File size is quite large. To ensure lightning-fast loading for customers, we recommend lookbook photos stay under 900KB.");
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setNewItem(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleAddGalleryItem = async (e) => {
        e.preventDefault();
        if (!newItem.title || !newItem.image) {
            alert("Please enter a Title and upload/select an Image.");
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
            
            // Add custom generated random ID or firestore ref ID
            setGalleryItems(prev => [{ id: docRef.id, ...docData }, ...prev]);
            
            // Reset form
            setNewItem({
                title: '',
                desc: '',
                image: '',
                category: 'blackout-zebra',
                link: '/products?category=zebra&opacity=blackout'
            });
            alert("New installation photo added successfully to the Lookbook Gallery!");
        } catch (error) {
            console.error("Error adding gallery item:", error);
            alert("Failed to add gallery item: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGalleryItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this installation photo from the Lookbook Gallery?")) {
            return;
        }

        setLoading(true);
        try {
            await deleteDoc(doc(db, "gallery_items", id));
            setGalleryItems(prev => prev.filter(item => item.id !== id));
            alert("Photo deleted successfully.");
        } catch (error) {
            console.error("Error deleting lookbook photo:", error);
            alert("Failed to delete.");
        } finally {
            setLoading(false);
        }
    };

    const filteredGalleryItems = galleryFilter === 'all' 
        ? galleryItems 
        : galleryItems.filter(item => item.category === galleryFilter);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>Content & Lookbook Management</h2>
                <button 
                    onClick={fetchContent}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        background: '#f1f1f1',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.85rem'
                    }}
                >
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    Sync Data
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '30px', flexWrap: 'wrap', gap: '5px' }}>
                <button
                    onClick={() => setActiveTab('about')}
                    style={{
                        padding: '15px 30px',
                        background: activeTab === 'about' ? 'white' : '#f9f9f9',
                        border: '1px solid #ddd',
                        borderBottom: activeTab === 'about' ? '1px solid white' : '1px solid #ddd',
                        marginBottom: '-1px',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'about' ? 'bold' : 'normal',
                        color: activeTab === 'about' ? '#333' : '#666',
                        borderRadius: '8px 8px 0 0'
                    }}
                >
                    About Us
                </button>
                <button
                    onClick={() => setActiveTab('faq')}
                    style={{
                        padding: '15px 30px',
                        background: activeTab === 'faq' ? 'white' : '#f9f9f9',
                        border: '1px solid #ddd',
                        borderBottom: activeTab === 'faq' ? '1px solid white' : '1px solid #ddd',
                        marginBottom: '-1px',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'faq' ? 'bold' : 'normal',
                        color: activeTab === 'faq' ? '#333' : '#666',
                        borderRadius: '8px 8px 0 0'
                    }}
                >
                    FAQ & Support
                </button>
                <button
                    onClick={() => setActiveTab('lookbook')}
                    style={{
                        padding: '15px 30px',
                        background: activeTab === 'lookbook' ? 'white' : '#f9f9f9',
                        border: '1px solid #ddd',
                        borderBottom: activeTab === 'lookbook' ? '1px solid white' : '1px solid #ddd',
                        marginBottom: '-1px',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'lookbook' ? 'bold' : 'normal',
                        color: activeTab === 'lookbook' ? '#333' : '#666',
                        borderRadius: '8px 8px 0 0'
                    }}
                >
                    Lookbook Gallery
                </button>
            </div>

            {/* About Us Editor */}
            {activeTab === 'about' && (
                <div style={{ background: 'white', padding: '30px', borderRadius: '0 8px 8px 8px', border: '1px solid #ddd', marginTop: '-1px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Edit About Us Page</h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Hero Title</label>
                        <input
                            type="text"
                            value={aboutData.heroTitle}
                            onChange={(e) => setAboutData({ ...aboutData, heroTitle: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Hero Subtitle</label>
                        <textarea
                            value={aboutData.heroSubtitle}
                            onChange={(e) => setAboutData({ ...aboutData, heroSubtitle: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Introduction Title</label>
                        <input
                            type="text"
                            value={aboutData.introTitle}
                            onChange={(e) => setAboutData({ ...aboutData, introTitle: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Introduction Text</label>
                        <textarea
                            value={aboutData.introText}
                            onChange={(e) => setAboutData({ ...aboutData, introText: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '150px' }}
                        />
                    </div>

                    <button
                        onClick={handleAboutSave}
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px' }}
                    >
                        {loading ? <Loader className="spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            )}

            {/* FAQ Editor */}
            {activeTab === 'faq' && (
                <div style={{ background: 'white', padding: '30px', borderRadius: '0 8px 8px 8px', border: '1px solid #ddd', marginTop: '-1px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Edit FAQs</h3>

                    {faqs.map((faq, index) => (
                        <div key={index} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee', position: 'relative' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Question</label>
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    placeholder="e.g., How do I measure?"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Answer</label>
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
                                    placeholder="Enter the answer..."
                                />
                            </div>
                            <button
                                onClick={() => removeFaq(index)}
                                style={{ position: 'absolute', top: '10px', right: '10px', color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={addFaq}
                            style={{
                                padding: '12px 20px',
                                background: 'white',
                                border: '1px dashed #999',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#666',
                                fontWeight: '500'
                            }}
                        >
                            + Add New Question
                        </button>
                        <button
                            onClick={handleFaqSave}
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px' }}
                        >
                            {loading ? <Loader className="spin" size={18} /> : <Save size={18} />}
                            Save All FAQs
                        </button>
                    </div>
                </div>
            )}

            {/* Lookbook Gallery Editor */}
            {activeTab === 'lookbook' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: '30px', alignItems: 'start' }}>
                    
                    {/* Add Item Form */}
                    <div style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#1d1d1f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={20} color="var(--primary-green)" />
                            Add Lookbook Photo
                        </h3>

                        <form onSubmit={handleAddGalleryItem}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>Title *</label>
                                <input 
                                    type="text"
                                    required
                                    value={newItem.title}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Cozy Living Room Zebra Blackout"
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>Description</label>
                                <textarea 
                                    value={newItem.desc}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, desc: e.target.value }))}
                                    placeholder="Brief details about the installation, material name, texture, etc."
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '60px', fontSize: '0.85rem' }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>Category *</label>
                                <select 
                                    value={newItem.category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', background: 'white' }}
                                >
                                    {GALLERY_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>Shop Link (Redirect URL) *</label>
                                <input 
                                    type="text"
                                    required
                                    value={newItem.link}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, link: e.target.value }))}
                                    placeholder="/products?category=..."
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '4px' }}>
                                    Helper: Autopopulated. This link guides users to shop this specific look.
                                </span>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>Image Selection *</label>
                                
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        id="gallery-file-picker"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <label 
                                        htmlFor="gallery-file-picker"
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            border: '1px dashed #999',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            fontSize: '0.8rem',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            color: '#555'
                                        }}
                                    >
                                        <ImageIcon size={14} />
                                        Upload Image File
                                    </label>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: '#555', textAlign: 'center', margin: '8px 0', fontWeight: 'bold' }}>OR</div>

                                <input 
                                    type="text"
                                    value={newItem.image.startsWith('data:') ? '' : newItem.image}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, image: e.target.value }))}
                                    placeholder="Paste Image URL directly (e.g. /images/...)"
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }}
                                />
                            </div>

                            {/* Image Preview Card */}
                            {newItem.image && (
                                <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '10px', borderRadius: '8px', background: '#fafafa' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#777', display: 'block', marginBottom: '6px' }}>Image Preview:</span>
                                    <div style={{ position: 'relative', width: '100%', paddingTop: '75%', borderRadius: '4px', overflow: 'hidden', background: '#eee' }}>
                                        <img 
                                            src={newItem.image} 
                                            alt="Preview" 
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'var(--primary-green)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(107, 116, 103, 0.2)'
                                }}
                            >
                                {loading ? <Loader className="spin" size={16} /> : <Plus size={16} />}
                                Add to Store Lookbook
                            </button>
                        </form>
                    </div>

                    {/* Showcase Gallery List */}
                    <div style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1d1d1f' }}>
                                Active Installation Photos ({filteredGalleryItems.length})
                            </h3>
                            
                            <select 
                                value={galleryFilter}
                                onChange={(e) => setGalleryFilter(e.target.value)}
                                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', background: 'white' }}
                            >
                                <option value="all">Show All Categories</option>
                                {GALLERY_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {filteredGalleryItems.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', border: '1px dashed #ccc', borderRadius: '8px', color: '#888' }}>
                                <ImageIcon size={32} style={{ marginBottom: '10px', opacity: 0.6 }} />
                                <p style={{ fontSize: '0.9rem' }}>No installation photos found in this category.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {filteredGalleryItems.map(item => (
                                    <div 
                                        key={item.id}
                                        style={{
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            background: '#fff',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#f5f5f7' }}>
                                            <img 
                                                src={item.image} 
                                                alt={item.title} 
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        </div>
                                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary-green)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                                                {GALLERY_CATEGORIES.find(c => c.id === item.category)?.name || item.category}
                                            </span>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 6px 0', color: '#1d1d1f', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {item.title}
                                            </h4>
                                            <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 12px 0', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {item.desc || 'No description provided.'}
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                <a 
                                                    href={item.link} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#666', textDecoration: 'none' }}
                                                >
                                                    <ExternalLink size={10} />
                                                    Shop
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteGalleryItem(item.id)}
                                                    disabled={loading}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#e53e3e',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '4px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentManagement;
