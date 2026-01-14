import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Plus, X, Image as ImageIcon, ExternalLink, Sparkles, Loader2, Trash2, Pencil } from 'lucide-react';
import { GOOGLE_SCRIPT_URL, GEMINI_API_KEY } from '../../lib/config';
import { GoogleGenerativeAI } from "@google/generative-ai";


const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiInputText, setAiInputText] = useState('');

    // Form State
    const initialFormState = {
        title: '',
        category: 'wood',
        basePrice: 0,
        description: '',
        imageUrl: '',
        colors: [], // Array of objects: { name, image, hex, component_id }
        configGroups: [], // Dynamic option groups: { name, type, options: [{name, price, desc}] }
        sizeRatio: 0,
        minWidth: 20, maxWidth: 100,
        minHeight: 10, maxHeight: 120,
        showMotor: true,
        showColor: true
    };
    const [newProduct, setNewProduct] = useState(initialFormState);

    // Temporary state for adding a new color option
    const [tempColor, setTempColor] = useState({
        name: '',
        image: '',
        hex: '#000000',
        component_id: ''
    });

    // Temporary state for custom configs
    const [tempConfig, setTempConfig] = useState({
        name: '',
        type: 'radio',
        options: []
    });
    const [tempOption, setTempOption] = useState({ name: '', price: 0, desc: '' });

    const [stockData, setStockData] = useState({});
    const [batchColorText, setBatchColorText] = useState('');


    // Fetch Products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsList);
        } catch (error) {
            console.error("Error fetching products:", error);
            alert(`Failed to fetch products: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchStockStatus = async () => {
        if (GOOGLE_SCRIPT_URL.includes('PLACEHOLDER')) return;
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?type=products`);
            const data = await res.json();
            // Create a map of ID -> { stockQty, minStock }
            const map = {};
            if (Array.isArray(data)) {
                data.forEach(item => {
                    if (item.id) {
                        map[item.id] = {
                            qty: item.stockQty,
                            min: item.safetyStock
                        };
                    }
                });
            }
            setStockData(map);
        } catch (e) {
            console.error("Failed to fetch stock:", e);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchStockStatus();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "categories"));
            const categoriesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoriesList);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleTempColorChange = (e) => {
        const { name, value } = e.target;
        setTempColor(prev => ({ ...prev, [name]: value }));
    };

    const addColorOption = () => {
        if (!tempColor.name || !tempColor.component_id) {
            alert("Color Name and Component ID are required.");
            return;
        }
        setNewProduct(prev => ({
            ...prev,
            colors: [...prev.colors, tempColor]
        }));
        // Reset temp color but keep hex for convenience
        setTempColor({ name: '', image: '', hex: '#000000', component_id: '' });
    };

    const removeColor = (indexToRemove) => {
        setNewProduct(prev => ({
            ...prev,
            colors: prev.colors.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleBatchColorAdd = () => {
        if (!batchColorText.trim()) return;
        const colorNames = batchColorText.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
        const newColors = colorNames.map(name => ({
            name,
            image: '',
            hex: '#cccccc',
            component_id: name.toUpperCase().replace(/\s+/g, '_')
        }));
        setNewProduct(prev => ({
            ...prev,
            colors: [...prev.colors, ...newColors]
        }));
        setBatchColorText('');
    };

    const applyTemplate = (type) => {
        const templates = {
            zebra: { title: 'New Zebra Blind', category: 'zebra', basePrice: 150, sizeRatio: 5, minWidth: 20, maxWidth: 110, minHeight: 10, maxHeight: 120, showMotor: true, showColor: true },
            roller: { title: 'New Roller Shade', category: 'roller', basePrice: 120, sizeRatio: 4, minWidth: 15, maxWidth: 120, minHeight: 12, maxHeight: 144, showMotor: true, showColor: true },
            motor: { title: 'Smart Motorized Blind', category: 'motor', basePrice: 280, sizeRatio: 8, minWidth: 24, maxWidth: 96, minHeight: 24, maxHeight: 96, showMotor: true, showColor: true },
            swatch: { title: 'Sample Swatch', category: 'swatch-zebra', basePrice: 5, sizeRatio: 0, minWidth: 5, maxWidth: 10, minHeight: 5, maxHeight: 10, showMotor: false, showColor: true }
        };

        if (templates[type]) {
            // Try to find a real category ID from Firestore that matches the template slug
            const matchingCat = categories.find(c => 
                c.id.toLowerCase().includes(type.toLowerCase()) || 
                c.name.toLowerCase().includes(type.toLowerCase())
            );
            
            const templateData = { ...initialFormState, ...templates[type] };
            if (matchingCat) {
                templateData.category = matchingCat.id;
            }

            setNewProduct(templateData);
            setShowForm(true);
        }
    };

    const handleDuplicate = (product) => {
        const { id, createdAt, updatedAt, ...rest } = product;
        setNewProduct({
            ...rest,
            title: `${rest.title} (Copy)`
        });
        setIsEditing(false);
        setCurrentProductId(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    // Custom Config Handlers
    const addOptionToTempConfig = () => {
        if (!tempOption.name) return;
        setTempConfig(prev => ({
            ...prev,
            options: [...prev.options, { ...tempOption, id: Date.now() }]
        }));
        setTempOption({ name: '', price: 0, desc: '' });
    };

    const removeOptionFromTempConfig = (id) => {
        setTempConfig(prev => ({
            ...prev,
            options: prev.options.filter(o => o.id !== id)
        }));
    };

    const addConfigGroup = () => {
        if (!tempConfig.name || tempConfig.options.length === 0) {
            alert("Group name and at least one option are required.");
            return;
        }
        setNewProduct(prev => ({
            ...prev,
            configGroups: [...(prev.configGroups || []), { ...tempConfig, id: Date.now() }]
        }));
        setTempConfig({ name: '', type: 'radio', options: [] });
    };

    const removeConfigGroup = (id) => {
        setNewProduct(prev => ({
            ...prev,
            configGroups: prev.configGroups.filter(g => g.id !== id)
        }));
    };

    const resetForm = () => {
        setNewProduct(initialFormState);
        setTempColor({ name: '', image: '', hex: '#000000', component_id: '' });
        setTempConfig({ name: '', type: 'radio', options: [] });
        setTempOption({ name: '', price: 0, desc: '' });
        setIsEditing(false);
        setCurrentProductId(null);
        setShowForm(false);
    };

    const handleEditClick = (product) => {
        // Ensure backward compatibility if old products have simple string colors
        const formattedColors = Array.isArray(product.colors)
            ? product.colors.map(c => typeof c === 'string' ? { name: 'Legacy Color', hex: c, component_id: 'UNKNOWN' } : c)
            : [];

        setNewProduct({
            title: product.title || '',
            category: product.category || 'wood',
            basePrice: product.basePrice || 0,
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            colors: formattedColors,
            configGroups: product.configGroups || [],
            sizeRatio: product.sizeRatio || 0,
            minWidth: product.minWidth || 20,
            maxWidth: product.maxWidth || 100,
            minHeight: product.minHeight || 10,
            maxHeight: product.maxHeight || 120,
            showMotor: product.showMotor !== undefined ? product.showMotor : true,
            showColor: product.showColor !== undefined ? product.showColor : true,
        });
        setCurrentProductId(product.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", id));
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate basic required fields
            if (!newProduct.title || !newProduct.category) {
                alert("Please enter title and category.");
                return;
            }

            const productData = {
                ...newProduct,
                basePrice: Number(newProduct.basePrice) || 0,
                sizeRatio: parseFloat(newProduct.sizeRatio) || 0,
                minWidth: Number(newProduct.minWidth) || 0,
                maxWidth: Number(newProduct.maxWidth) || 0,
                minHeight: Number(newProduct.minHeight) || 0,
                maxHeight: Number(newProduct.maxHeight) || 0,
                showMotor: newProduct.showMotor !== undefined ? newProduct.showMotor : true,
                showColor: newProduct.showColor !== undefined ? newProduct.showColor : true,
                colors: newProduct.colors || [],
                configGroups: newProduct.configGroups || [],
                updatedAt: new Date().toISOString()
            };

            // Remove any potential undefined values or functions from productData
            Object.keys(productData).forEach(key => {
                if (productData[key] === undefined) {
                    delete productData[key];
                }
            });

            if (isEditing) {
                await updateDoc(doc(db, "products", currentProductId), productData);
                alert('Product updated successfully.');
            } else {
                productData.createdAt = new Date().toISOString();
                await addDoc(collection(db, "products"), productData);
                alert('Product created successfully.');
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            // Show more helpful error to user
            alert(`Error saving product: ${error.message || 'Unknown error'}`);
        }
    };

    const handleSyncToSheet = async () => {
        if (!products || products.length === 0) {
            alert("No products to sync.");
            return;
        }

        const confirm = window.confirm(
            "This will overwrite the 'Products' sheet in your Google Spreadsheet with the current list from this admin panel.\n\n" +
            "Existing Inventory (Stock) counts in the sheet will be PRESERVED.\n\n" +
            "Are you sure you want to proceed?"
        );

        if (!confirm) return;

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "sync_products",
                    products: products
                })
            });

            const result = await response.json();

            if (result.result === 'success') {
                alert(`Successfully synced ${result.count} products to Google Sheet.`);
                fetchStockStatus(); // Refresh stock after sync
            } else {
                alert("Failed to sync: " + (result.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Sync Error:", error);
            alert("Sync requested. Please check your Google Sheet.");
        }
    };
    const handleAIExtractFromText = async (text) => {
        if (!text || text.trim().length < 10) {
            alert("내용을 조금 더 자세히 입력해주세요.");
            return;
        }

        if (!GEMINI_API_KEY) {
            alert("Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
            return;
        }

        setIsScanning(true);
        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Extract product information from the following text and return it as a JSON object.
                If information is missing, use sensible defaults.
                
                Product Categories available: zebra, roller, cellular, motor.
                
                Fields:
                - title: string
                - basePrice: number
                - description: string
                - category: string (one of the above)
                - colors: array of {name: string, hex: string, component_id: string}
                
                Return ONLY the JSON.
                
                Text:
                "${text}"
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const jsonText = response.text().replace(/```json|```/g, "").trim();
            const extractedData = JSON.parse(jsonText);

            setNewProduct(prev => ({ ...prev, ...extractedData }));
            setShowForm(true);
            setShowAIModal(false);
            setAiInputText('');
            alert("Gemini AI가 텍스트를 분석하여 정보를 채웠습니다. 확인 후 저장해주세요!");
        } catch (e) {
            console.error("AI Error:", e);
            alert("분석 중 오류가 발생했습니다. API 키 또는 네트워크를 확인해주세요.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleAIScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!GEMINI_API_KEY) {
            alert("Gemini API 키가 설정되지 않았습니다.");
            return;
        }

        setIsScanning(true);
        try {
            // Helper function to convert file to generative part
            const fileToGenerativePart = async (file) => {
                const base64EncodedDataPromise = new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(file);
                });
                return {
                    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
                };
            };

            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Analyze this catalog image and extract product information. 
                Return the information as a JSON object.
                
                Categories: zebra, roller, cellular, motor.
                
                Fields:
                - title: product name
                - basePrice: numeric price (if multiple, use the lowest or a base)
                - description: feature/specs summary
                - category: one of the specified categories
                - colors: list of colors shown or mentioned {name, hex (if visible/guessable), component_id (create unique ID based on color name)}
                
                Return ONLY the JSON.
            `;

            const imagePart = await fileToGenerativePart(file);
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const jsonText = response.text().replace(/```json|```/g, "").trim();
            const extractedData = JSON.parse(jsonText);

            setNewProduct(prev => ({ ...prev, ...extractedData }));
            setShowForm(true);
            setShowAIModal(false);
            alert("이미지 분석이 완료되었습니다! 추출된 정보를 확인해주세요.");
            
        } catch (error) {
            console.error("AI Scan Error:", error);
            alert("이미지 분석에 실패했습니다. (Gemini API 오류)");
        } finally {
            setIsScanning(false);
            e.target.value = null;
        }
    };


    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>Product Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn"
                        onClick={fetchStockStatus}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #ddd', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                        title="Refresh Stock from Sheet"
                    >
                        Refresh Stock
                    </button>
                    <button
                        className="btn"
                        onClick={() => setShowAIModal(true)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            background: 'linear-gradient(135deg, #6e8efb, #a777e3)', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px 16px', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(110, 142, 251, 0.3)'
                        }}
                    >
                        <Sparkles size={18} />
                        AI 카달로그 등록
                    </button>
                    <button
                        className="btn"
                        onClick={handleSyncToSheet}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#34a853', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                    >
                        <ExternalLink size={18} /> Sync to Sheet
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowForm(!showForm);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? 'Cancel' : 'Add New Product'}
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>{isEditing ? 'Edit Product' : 'Create New Product'}</h3>
                        {!isEditing && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#666', alignSelf: 'center', marginRight: '5px' }}>Quick Templates:</span>
                                {['zebra', 'roller', 'motor'].map(t => (
                                    <button 
                                        key={t}
                                        type="button" 
                                        onClick={() => applyTemplate(t)}
                                        style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid #ddd', background: '#f9f9f9', fontSize: '0.8rem', cursor: 'pointer', textTransform: 'capitalize' }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Product Name</label>
                            <input type="text" name="title" required value={newProduct.title} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                            <select name="category" value={newProduct.category} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}>
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                                {/* Fallback options if no categories exist yet */}
                                {categories.length === 0 && (
                                    <>
                                        <option value="zebra">Zebra Blinds</option>
                                        <option value="roller">Roller Shades</option>
                                        <option value="cellular">Cellular Shades</option>
                                        <option value="motor">Motorized Blinds</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Base Price ($)</label>
                                <input type="number" name="basePrice" required value={newProduct.basePrice} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Size Ratio ($/sq.ft)</label>
                                <input type="number" name="sizeRatio" step="0.01" value={newProduct.sizeRatio} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            </div>
                        </div>

                        {/* Visibility Toggles */}
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="showMotor"
                                    checked={newProduct.showMotor}
                                    onChange={(e) => setNewProduct({ ...newProduct, showMotor: e.target.checked })}
                                />
                                Show Motor Option
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="showColor"
                                    checked={newProduct.showColor}
                                    onChange={(e) => setNewProduct({ ...newProduct, showColor: e.target.checked })}
                                />
                                Show Color Option
                            </label>
                        </div>

                        {/* Size Constraints */}
                        <div style={{ gridColumn: '1 / -1', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#555' }}>Size Constraints (Inches)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Min Width</label>
                                    <input type="number" name="minWidth" value={newProduct.minWidth} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Max Width</label>
                                    <input type="number" name="maxWidth" value={newProduct.maxWidth} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Min Height</label>
                                    <input type="number" name="minHeight" value={newProduct.minHeight} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Max Height</label>
                                    <input type="number" name="maxHeight" value={newProduct.maxHeight} onChange={handleInputChange} className="form-input" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Image URL</label>
                            <input type="url" name="imageUrl" value={newProduct.imageUrl} onChange={handleInputChange} placeholder="https://..." style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                            <textarea name="description" value={newProduct.description} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '100px' }}></textarea>
                        </div>

                        {/* Custom Options Module: Colors & Inventory */}
                        <div style={{ gridColumn: '1 / -1', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                            <h4 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ImageIcon size={18} /> Color & Inventory Settings
                            </h4>

                            {/* Color Input Area */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 50px auto', gap: '10px', alignItems: 'end', marginBottom: '15px', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Color Name (e.g. Snow White)</label>
                                    <input type="text" name="name" value={tempColor.name} onChange={handleTempColorChange} placeholder="Navi Blue" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Texture/Image URL</label>
                                    <input type="text" name="image" value={tempColor.image} onChange={handleTempColorChange} placeholder="https://..." style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Inventory Component ID</label>
                                    <input type="text" name="component_id" value={tempColor.component_id} onChange={handleTempColorChange} placeholder="FAB_001" style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#666' }}>Hex</label>
                                    <input type="color" name="hex" value={tempColor.hex} onChange={handleTempColorChange} style={{ width: '100%', height: '35px', padding: '0', border: 'none', cursor: 'pointer' }} />
                                </div>
                                <button type="button" onClick={addColorOption} className="btn" style={{ background: '#333', color: 'white', padding: '0 15px', height: '35px', borderRadius: '4px' }}>Add</button>
                            </div>

                            {/* Batch Color Add */}
                            <div style={{ marginBottom: '15px', padding: '15px', background: '#f0f4f8', borderRadius: '8px', border: '1px solid #d1d9e6' }}>
                                <label style={{ fontSize: '0.8rem', color: '#444', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Batch Add Colors (Comma separated)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        value={batchColorText} 
                                        onChange={(e) => setBatchColorText(e.target.value)}
                                        placeholder="White, Snow White, Charcoal, Silver..." 
                                        style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleBatchColorAdd}
                                        style={{ background: '#6e8efb', color: 'white', border: 'none', padding: '0 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        Import Colors
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '5px' }}>Example: "White, Gray, Black" will auto-create 3 color entries.</p>
                            </div>


                            {/* Color List */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                                {newProduct.colors.map((c, i) => (
                                    <div key={i} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', background: 'white', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <div style={{ height: '80px', background: c.image ? `url(${c.image}) center/cover` : c.hex, borderRadius: '4px', border: '1px solid #eee' }}></div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>ID: {c.component_id}</div>
                                        <button
                                            type="button"
                                            onClick={() => removeColor(i)}
                                            style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,255,255,0.8)', color: 'red', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {newProduct.colors.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#999', fontStyle: 'italic' }}>No colors added yet. Add a color above to link inventory.</div>}
                            </div>
                        </div>

                        {/* Custom Configuration Groups (Smartwings Style) */}
                        <div style={{ gridColumn: '1 / -1', background: '#f0f4f8', padding: '20px', borderRadius: '8px', border: '1px solid #d1d9e6', marginTop: '10px' }}>
                            <h4 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={18} color="#6e8efb" /> Custom Configuration Groups
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>
                                Add custom selection groups like "Motor Type", "Remote Control", or "Valance Style".
                            </p>

                            {/* Create Group Form */}
                            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Group Name (e.g. Motor Type)</label>
                                        <input 
                                            type="text" 
                                            value={tempConfig.name} 
                                            onChange={(e) => setTempConfig({...tempConfig, name: e.target.value})}
                                            placeholder="Motor Type"
                                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Input Type</label>
                                        <select 
                                            value={tempConfig.type} 
                                            onChange={(e) => setTempConfig({...tempConfig, type: e.target.value})}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        >
                                            <option value="radio">Selection Cards (Recommended)</option>
                                            <option value="select">Dropdown Menu</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Add Option to Group */}
                                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr auto', gap: '10px', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem' }}>Option Name (e.g. Zigbee)</label>
                                            <input 
                                                type="text" 
                                                value={tempOption.name} 
                                                onChange={(e) => setTempOption({...tempOption, name: e.target.value})}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem' }}>Add. Price ($)</label>
                                            <input 
                                                type="number" 
                                                value={tempOption.price} 
                                                onChange={(e) => setTempOption({...tempOption, price: Number(e.target.value)})}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem' }}>Short Desc (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={tempOption.desc} 
                                                onChange={(e) => setTempOption({...tempOption, desc: e.target.value})}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={addOptionToTempConfig}
                                            style={{ background: '#333', color: 'white', border: 'none', padding: '0 15px', height: '35px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Add Option
                                        </button>
                                    </div>

                                    {/* Temp Options List */}
                                    <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {tempConfig.options.map(opt => (
                                            <div key={opt.id} style={{ background: 'white', border: '1px solid #ddd', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{opt.name} (+${opt.price})</span>
                                                <X size={14} style={{ cursor: 'pointer', color: '#999' }} onClick={() => removeOptionFromTempConfig(opt.id)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="button" 
                                    onClick={addConfigGroup}
                                    style={{ width: '100%', marginTop: '15px', padding: '12px', background: '#6e8efb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Add This Group to Product
                                </button>
                            </div>

                            {/* Existing Groups List */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                                {(newProduct.configGroups || []).map(group => (
                                    <div key={group.id} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', position: 'relative' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => removeConfigGroup(group.id)}
                                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                                        >
                                            <X size={18} />
                                        </button>
                                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>{group.name}</div>
                                        <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: '#666', margin: 0 }}>
                                            {group.options.map(o => (
                                                <li key={o.id}>{o.name} (+${o.price})</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>
                                {isEditing ? 'Update Product' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product List Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0 }}>All Products ({products.length})</h3>
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading products...</div>
                ) : products.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No products found. Click "Add New Product" to create one.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Image</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Product Details</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Category</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Price</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#555' }}>Live Stock (Sheet)</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600', color: '#555' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => {
                                const stockInfo = stockData[product.id] || {};
                                const hasStock = stockInfo.qty !== undefined;
                                const isLow = hasStock && (Number(stockInfo.qty) <= Number(stockInfo.min || 10));

                                return (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px', width: '80px' }}>
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: '500', color: '#333' }}>{product.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#777', marginTop: '4px' }}>
                                                {product.colors && product.colors.length} Colors / Options
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                background: '#e3f2fd',
                                                color: '#1565c0',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                textTransform: 'capitalize'
                                            }}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', fontWeight: '500' }}>
                                            ${product.basePrice}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {hasStock ? (
                                                <div style={{ color: isLow ? 'red' : 'green', fontWeight: '600' }}>
                                                    {stockInfo.qty} Units
                                                    {isLow && <div style={{ fontSize: '0.7rem' }}>Low Stock!</div>}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#ccc', fontSize: '0.8rem' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleDuplicate(product)}
                                                    style={{
                                                        padding: '8px',
                                                        background: 'none',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#666'
                                                    }}
                                                    title="Duplicate Product"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(product)}

                                                    style={{
                                                        padding: '8px',
                                                        background: 'none',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#666'
                                                    }}
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product.id)}
                                                    style={{
                                                        padding: '8px',
                                                        background: 'none',
                                                        border: '1px solid #ffcdd2',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#c62828'
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            {/* AI Registration Modal */}
            {showAIModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles color="#6e8efb" /> AI 제품 등록기
                            </h3>
                            <button onClick={() => setShowAIModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '15px', fontWeight: '500', color: '#444' }}>방법 1: 카달로그 사진 업로드</label>
                            <label style={{ 
                                display: 'block', 
                                border: '2px dashed #ddd', 
                                padding: '30px', 
                                textAlign: 'center', 
                                borderRadius: '12px', 
                                cursor: isScanning ? 'not-allowed' : 'pointer',
                                background: '#fcfcfe'
                            }}>
                                {isScanning ? (
                                    <div style={{ color: '#6e8efb' }}>
                                        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 10px' }} />
                                        <p>내용을 분석하고 있습니다...</p>
                                    </div>
                                ) : (
                                    <div>
                                        <ImageIcon size={32} color="#999" style={{ margin: '0 auto 10px' }} />
                                        <p style={{ color: '#666' }}>이미지 또는 PDF 파일을 선택하세요</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*,application/pdf" onChange={handleAIScan} disabled={isScanning} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '25px', textAlign: 'center' }}>
                            <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
                            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', color: '#999', fontSize: '0.9rem' }}>또는</span>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#444' }}>방법 2: 카달로그 내용 직접 붙여넣기</label>
                            <textarea 
                                value={aiInputText}
                                onChange={(e) => setAiInputText(e.target.value)}
                                placeholder="예: [제품명] 우드 블라인드 화이트, [가격] 150불, [특징] 최고급 친환경 소재..."
                                style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px', resize: 'none' }}
                            />
                            <button 
                                onClick={() => handleAIExtractFromText(aiInputText)}
                                disabled={isScanning || !aiInputText.trim()}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    background: isScanning || !aiInputText.trim() ? '#ccc' : '#333', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    fontWeight: '600', 
                                    cursor: 'pointer' 
                                }}
                            >
                                {isScanning ? '분석 중...' : '텍스트로 제품 정보 추출'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
