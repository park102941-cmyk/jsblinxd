import React, { useState, useEffect } from 'react';
import { Search, Package, Wrench, Wifi, Truck, RotateCcw, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const Support = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const categories = [
        { icon: <Package size={32} />, title: "Start Order", link: "/products" },
        { icon: <Wrench size={32} />, title: "Install", link: "#" },
        { icon: <Wifi size={32} />, title: "Connect", link: "#" },
        { icon: <Truck size={32} />, title: "Shipping", link: "#shipping" },
        { icon: <RotateCcw size={32} />, title: "Returns", link: "#returns" },
        { icon: <ShieldCheck size={32} />, title: "Warranty", link: "#" }
    ];

    const [faqs, setFaqs] = useState([
        {
            question: "How do I measure my windows?",
            answer: "We have a comprehensive measurement guide available on our website. Generally, you'll need to measure the width and height of your window frame at three different points (top, middle, bottom for width; left, center, right for height) and use the smallest width and longest height for inside mounts."
        },
        {
            question: "What is the difference between single and multi-channel remotes?",
            answer: "A single-channel remote controls one blind or a group of blinds simultaneously. A multi-channel remote (e.g., 2, 6, or 15 channels) allows you to control multiple blinds individually or in groups using a single remote control."
        }
    ]);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const docRef = doc(db, "content_pages", "faq");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().items) {
                    setFaqs(docSnap.data().items);
                }
            } catch (error) {
                console.error("Error fetching FAQs:", error);
            }
        };
        fetchFaqs();
    }, []);

    return (
        <div style={{ paddingBottom: '60px' }}>
            {/* Hero Search Section */}
            <div style={{
                background: 'var(--primary-green)', // Matching the new theme
                padding: '60px 20px',
                textAlign: 'center',
                color: 'white'
            }}>
                <h1 style={{ marginBottom: '30px', fontWeight: '400', fontSize: '2.5rem' }}>How can we help?</h1>
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        style={{
                            width: '100%',
                            padding: '15px 50px 15px 20px',
                            borderRadius: '30px',
                            border: 'none',
                            fontSize: '1rem',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            outline: 'none'
                        }}
                    />
                    <button style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#666'
                    }}>
                        <Search size={24} />
                    </button>
                </div>
            </div>

            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                {/* Categories Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '20px',
                    marginBottom: '60px'
                }}>
                    {categories.map((cat, index) => (
                        <a href={cat.link} key={index} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '30px 10px',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            color: '#4A4E53',
                            transition: 'all 0.3s ease',
                            textDecoration: 'none'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.05)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#eee';
                            }}
                        >
                            <div style={{ marginBottom: '15px', color: 'var(--primary-green)' }}>{cat.icon}</div>
                            <span style={{ fontWeight: '500' }}>{cat.title}</span>
                        </a>
                    ))}
                </div>

                {/* FAQ Section */}
                <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '400', color: '#333' }}>Frequently Asked Questions</h2>
                <div style={{ marginBottom: '60px' }}>
                    {faqs.map((faq, index) => (
                        <div key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '20px 0',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.1rem',
                                    color: '#333',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                {faq.question}
                                <span style={{ fontSize: '1.5rem', color: '#999', paddingLeft: '10px' }}>{openIndex === index ? '-' : '+'}</span>
                            </button>
                            {openIndex === index && (
                                <div style={{ paddingBottom: '20px', color: '#666', lineHeight: '1.6' }}>
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Returns Policy Section */}
                <section id="returns" style={{ marginBottom: '60px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '400', color: '#333' }}>Returns & Refund Policy</h2>
                    <div style={{ 
                        background: '#fff', 
                        padding: '40px', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
                        lineHeight: '1.8' 
                    }}>
                        <h3 style={{ fontSize: '1.3rem', color: 'var(--secondary-olive)', marginBottom: '15px' }}>100% Satisfaction Guarantee</h3>
                        <p>Something wrong with your order? Don't worry! We are committed to providing you with the highest quality custom blinds. If you encounter any issues, we will make it right.</p>
                        
                        <h3 style={{ fontSize: '1.3rem', color: 'var(--secondary-olive)', marginTop: '30px', marginBottom: '15px' }}>Hassle-Free "No-Return" Replacement Policy</h3>
                        <p>Our commitment is simple: <strong>Replacement within 30 days of delivery — no return needed.</strong> Based on photo or video evidence, we will immediately start producing your replacement item. We value your time and convenience above all.</p>

                        <div style={{ background: '#F9F9FB', padding: '25px', borderRadius: '8px', marginTop: '25px' }}>
                            <h4 style={{ marginBottom: '15px', color: '#333', fontWeight: '600' }}>Required Evidence for Claims</h4>
                            <p style={{ marginBottom: '15px', fontSize: '0.95rem', color: '#666' }}>Please provide the following within 7 days of delivery to our support team:</p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                                    <h5 style={{ fontWeight: '600', marginBottom: '10px', color: 'var(--secondary-olive)' }}>1. Photo Evidence (3 Essential Shots)</h5>
                                    <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#444' }}>
                                        <li style={{ marginBottom: '6px' }}><strong>Shipping Label:</strong> A clear photo of the shipping label on the original box.</li>
                                        <li style={{ marginBottom: '6px' }}><strong>Full Installation View:</strong> A wide shot showing the blinds fully installed.</li>
                                        <li style={{ marginBottom: '6px' }}><strong>Defect Detail:</strong> A close-up shot of the specific issue (tear, dent, etc.).</li>
                                    </ul>
                                </div>
                                <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                                    <h5 style={{ fontWeight: '600', marginBottom: '10px', color: 'var(--secondary-olive)' }}>2. Video Evidence (For Functional Issues)</h5>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#444' }}>A short 20-30 second video including:</p>
                                    <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#444' }}>
                                        <li style={{ marginBottom: '4px' }}>Power connection (battery pack or cable).</li>
                                        <li style={{ marginBottom: '4px' }}>Operation attempt via remote or app.</li>
                                        <li style={{ marginBottom: '4px' }}>Clear capture of the symptom or lack of response.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <p style={{ marginTop: '30px', color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            <strong>Note:</strong> As each product is tailor-made to your specifications, the standard remake process starts immediately after photo/video confirmation of the defect.
                        </p>
                    </div>
                </section>

                {/* Shipping Info Section */}
                <section id="shipping" style={{ marginBottom: '60px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '400', color: '#333' }}>Shipping Information</h2>
                    <div style={{ 
                        background: 'var(--secondary-olive)', 
                        padding: '40px', 
                        borderRadius: '12px', 
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(75, 83, 72, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                            <Truck size={40} />
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Express Air via FedEx / DHL / UPS</h3>
                            </div>
                        </div>
                        <p style={{ fontSize: '1.25rem', marginBottom: '15px', fontWeight: '500' }}>Standard Delivery: 5 - 10 Days (Post-Production)</p>
                        <p style={{ opacity: 0.9, lineHeight: '1.7', fontSize: '1.05rem' }}>
                            We partner with top carriers to ensure your custom blinds arrive safely and quickly within the United States. Shipping is fully included in the price—no hidden fees at your doorstep.
                        </p>
                    </div>
                </section>

                {/* Contact Section */}
                <div style={{
                    background: '#F9F9FB',
                    padding: '40px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                    gap: '40px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'var(--primary-green)', marginBottom: '15px' }}><Mail size={32} /></div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Email Us</h3>
                        <p style={{ color: '#666' }}></p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'var(--primary-green)', marginBottom: '15px' }}><Calendar size={32} /></div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Working Hours</h3>
                        <p style={{ color: '#666' }}>10AM - 7PM CST (Mon-Fri)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
