import React, { useState } from 'react';
import { Sparkles, Wand2, FileText, DollarSign, Palette, TrendingUp, Loader2, Copy, Check } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from '../../lib/config';

const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('description');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    // Form states
    const [productName, setProductName] = useState('');
    const [productFeatures, setProductFeatures] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [competitorPrices, setCompetitorPrices] = useState('');
    const [colorScheme, setColorScheme] = useState('');
    const [productData, setProductData] = useState('');

    const generateContent = async (type) => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PLACEHOLDER')) {
            alert('Please set up your Gemini API key in the .env file');
            return;
        }

        setLoading(true);
        setResult('');

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            let prompt = '';

            switch (type) {
                case 'description':
                    prompt = `Create a compelling, SEO-optimized product description for an e-commerce website.

Product Name: ${productName}
Key Features: ${productFeatures}
Target Audience: ${targetAudience}

Requirements:
- Write in a professional yet engaging tone
- Include relevant keywords naturally
- Highlight benefits, not just features
- Use persuasive language
- Keep it between 150-200 words
- Format with short paragraphs for readability

Generate the product description:`;
                    break;

                case 'pricing':
                    prompt = `Analyze pricing strategy and provide recommendations.

Product: ${productName}
Current Price: $${currentPrice}
Competitor Prices: ${competitorPrices}
Target Audience: ${targetAudience}

Provide:
1. Optimal price point recommendation
2. Pricing strategy (premium, competitive, value)
3. Psychological pricing suggestions
4. Bundle pricing ideas
5. Discount strategy recommendations

Format as a clear, actionable report:`;
                    break;

                case 'colors':
                    prompt = `Suggest color combinations for a window treatment product.

Product Type: ${productName}
Current Colors: ${colorScheme}
Target Market: ${targetAudience}

Provide:
1. 5 trending color combinations
2. Color psychology insights
3. Seasonal recommendations
4. Complementary color suggestions
5. Color names that sell well

Format as a structured list:`;
                    break;

                case 'trends':
                    prompt = `Analyze market trends and provide insights for window treatment business.

Product Category: ${productName}
Current Data: ${productData}

Provide:
1. Current market trends
2. Emerging customer preferences
3. Seasonal demand patterns
4. Competitive landscape insights
5. Growth opportunities
6. Actionable recommendations

Format as a comprehensive market analysis:`;
                    break;

                case 'email':
                    prompt = `Create a professional marketing email template.

Product: ${productName}
Key Features: ${productFeatures}
Target Audience: ${targetAudience}

Create an email that includes:
- Compelling subject line
- Engaging opening
- Clear value proposition
- Call-to-action
- Professional closing

Format as a ready-to-use email template:`;
                    break;

                case 'social':
                    prompt = `Create social media content for product promotion.

Product: ${productName}
Features: ${productFeatures}
Target Audience: ${targetAudience}

Generate:
1. 3 Instagram captions (with hashtags)
2. 2 Facebook posts
3. 3 Twitter/X posts
4. 1 LinkedIn post

Make them engaging, platform-appropriate, and conversion-focused:`;
                    break;

                default:
                    prompt = 'Generate helpful content for this product.';
            }

            const response = await model.generateContent(prompt);
            const text = response.response.text();
            setResult(text);
        } catch (error) {
            console.error('AI Generation Error:', error);
            setResult('Error generating content. Please check your API key and try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = [
        { id: 'description', label: 'Product Description', icon: FileText },
        { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
        { id: 'colors', label: 'Color Suggestions', icon: Palette },
        { id: 'trends', label: 'Market Trends', icon: TrendingUp },
        { id: 'email', label: 'Email Template', icon: FileText },
        { id: 'social', label: 'Social Media', icon: Sparkles }
    ];

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333', margin: 0, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={28} color="#667eea" />
                    AI Assistant
                </h2>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                    Powered by Google Gemini - Generate content, analyze data, and get smart recommendations
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '8px' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 20px',
                                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                                color: activeTab === tab.id ? 'white' : '#333',
                                border: activeTab === tab.id ? 'none' : '1px solid #e0e0e0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                            }}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Input Section */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wand2 size={20} color="#667eea" />
                        Input Information
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                Product Name *
                            </label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g., Motorized Zebra Shades"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                            />
                        </div>

                        {(activeTab === 'description' || activeTab === 'email' || activeTab === 'social') && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                        Key Features
                                    </label>
                                    <textarea
                                        value={productFeatures}
                                        onChange={(e) => setProductFeatures(e.target.value)}
                                        placeholder="List the main features and benefits..."
                                        rows={4}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                        Target Audience
                                    </label>
                                    <input
                                        type="text"
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                        placeholder="e.g., Homeowners, Interior Designers"
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'pricing' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                        Current Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={currentPrice}
                                        onChange={(e) => setCurrentPrice(e.target.value)}
                                        placeholder="150"
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                        Competitor Prices
                                    </label>
                                    <input
                                        type="text"
                                        value={competitorPrices}
                                        onChange={(e) => setCompetitorPrices(e.target.value)}
                                        placeholder="e.g., $120, $180, $200"
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                        Target Audience
                                    </label>
                                    <input
                                        type="text"
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                        placeholder="e.g., Mid to high-end homeowners"
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'colors' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                        Current Color Scheme
                                    </label>
                                    <input
                                        type="text"
                                        value={colorScheme}
                                        onChange={(e) => setColorScheme(e.target.value)}
                                        placeholder="e.g., White, Gray, Beige"
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                        Target Market
                                    </label>
                                    <input
                                        type="text"
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                        placeholder="e.g., Modern minimalist homes"
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'trends' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>
                                    Additional Data (Optional)
                                </label>
                                <textarea
                                    value={productData}
                                    onChange={(e) => setProductData(e.target.value)}
                                    placeholder="Any sales data, customer feedback, or market observations..."
                                    rows={4}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
                                />
                            </div>
                        )}

                        <button
                            onClick={() => generateContent(activeTab)}
                            disabled={loading || !productName}
                            style={{
                                padding: '14px 24px',
                                background: loading || !productName ? '#e0e0e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: loading || !productName ? '#999' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading || !productName ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '10px',
                                boxShadow: loading || !productName ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Generate with AI
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Result Section */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: 0 }}>
                            AI Generated Result
                        </h3>
                        {result && (
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    padding: '8px 16px',
                                    background: copied ? '#2e7d32' : '#f5f5f5',
                                    color: copied ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        )}
                    </div>

                    <div style={{
                        minHeight: '400px',
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        fontSize: '0.9rem',
                        lineHeight: '1.7',
                        color: '#333',
                        whiteSpace: 'pre-wrap',
                        overflowY: 'auto',
                        maxHeight: '600px'
                    }}>
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                                <Loader2 size={48} color="#667eea" className="animate-spin" />
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>AI is generating your content...</p>
                            </div>
                        ) : result ? (
                            result
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
                                <Sparkles size={48} color="#ccc" />
                                <p style={{ color: '#999', textAlign: 'center' }}>
                                    Fill in the information and click "Generate with AI"<br />
                                    to get AI-powered content suggestions
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tips Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '24px',
                borderRadius: '12px',
                marginTop: '30px',
                color: 'white'
            }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} />
                    Pro Tips for Better Results
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', lineHeight: '1.8', opacity: 0.95 }}>
                    <li>Be specific with product features and benefits</li>
                    <li>Provide context about your target audience</li>
                    <li>Include relevant data for more accurate analysis</li>
                    <li>Review and customize the AI-generated content to match your brand voice</li>
                    <li>Use the generated content as a starting point and refine as needed</li>
                </ul>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default AIAssistant;
