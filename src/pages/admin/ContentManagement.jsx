import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Loader } from 'lucide-react';

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState('about'); // 'about' or 'faq'
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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>Content Management</h2>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '30px' }}>
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
        </div>
    );
};

export default ContentManagement;
