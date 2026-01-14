import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Plus, X, Trash2, Pencil, Loader2, List } from 'lucide-react';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState(null);

    const initialFormState = {
        name: '',
        id: '', // URL friendly ID (e.g., 'zebra')
        description: '',
        imageUrl: '',
        isVisible: true,
        section: 'Shades', // Default section
        order: 0
    };
    const [newCategory, setNewCategory] = useState(initialFormState);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "categories"));
            const categoriesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoriesList);
        } catch (error) {
            console.error("Error fetching categories:", error);
            alert("Failed to fetch categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setNewCategory(initialFormState);
        setIsEditing(false);
        setCurrentCategoryId(null);
        setShowForm(false);
    };

    const handleEditClick = (category) => {
        setNewCategory({
            name: category.name || '',
            id: category.id || '',
            description: category.description || '',
            imageUrl: category.imageUrl || '',
            isVisible: category.isVisible !== undefined ? category.isVisible : true,
            section: category.section || 'Shades',
            order: category.order || 0
        });
        setCurrentCategoryId(category.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this category? Products using this category will remain, but the category association might be broken.")) {
            try {
                await deleteDoc(doc(db, "categories", id));
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("Failed to delete category.");
            }
        }
    };

    const toggleVisibility = async (category) => {
        try {
            const docRef = doc(db, "categories", category.id);
            await updateDoc(docRef, { isVisible: !category.isVisible });
            fetchCategories();
        } catch (error) {
            console.error("Error toggling visibility:", error);
        }
    };

    const seedDefaults = async () => {
        if (!window.confirm("This will add the standard categories (Roller, Zebra, etc.) to your management list. Continue?")) return;
        
        const defaults = [
            { id: 'roller', name: 'Roller Shades', section: 'Shades', order: 10, isVisible: true },
            { id: 'zebra', name: 'Zebra Shades', section: 'Shades', order: 20, isVisible: true },
            { id: 'cellular', name: 'Cellular Shades', section: 'Shades', order: 30, isVisible: true },
            { id: 'roman', name: 'Roman Shades', section: 'Shades', order: 40, isVisible: true },
        ];

        try {
            setLoading(true);
            for (const cat of defaults) {
                await setDoc(doc(db, "categories", cat.id), {
                    ...cat,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            alert("Default categories seeded successfully!");
            fetchCategories();
        } catch (error) {
            console.error("Error seeding categories:", error);
            alert("Failed to seed categories.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const categoryData = {
                ...newCategory,
                updatedAt: new Date().toISOString()
            };

            if (isEditing) {
                // If editing, we use the existing ID
                await setDoc(doc(db, "categories", currentCategoryId), categoryData);
                alert('Category updated successfully.');
            } else {
                // Use the provided ID as the document ID
                const docId = newCategory.id.toLowerCase().replace(/\s+/g, '-');
                const docRef = doc(db, "categories", docId);
                
                // Check if already exists
                const existing = categories.find(c => c.id === docId);
                if (existing) {
                    alert("Category with this ID already exists.");
                    return;
                }

                categoryData.createdAt = new Date().toISOString();
                categoryData.id = docId;
                await setDoc(docRef, categoryData);
                alert('Category created successfully.');
            }

            resetForm();
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            alert('Error saving category.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>Category Management</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? 'Cancel' : 'Add New Category'}
                </button>
            </div>

            {!showForm && categories.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9fa', borderRadius: '12px', marginBottom: '30px', border: '2px dashed #ddd' }}>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Your category list is currently empty. Would you like to start with the default collections?</p>
                    <button onClick={seedDefaults} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                        Seed Default Categories
                    </button>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
                    <h3 style={{ marginBottom: '20px' }}>{isEditing ? 'Edit Category' : 'Create New Category'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category Name (Display)</label>
                            <input 
                                type="text" 
                                name="name" 
                                required 
                                value={newCategory.name} 
                                onChange={handleInputChange} 
                                placeholder="e.g. Zebra Blinds"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category ID (URL slug)</label>
                            <input 
                                type="text" 
                                name="id" 
                                required 
                                disabled={isEditing}
                                value={newCategory.id} 
                                onChange={handleInputChange} 
                                placeholder="e.g. zebra"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', background: isEditing ? '#f5f5f5' : 'white' }} 
                            />
                            {!isEditing && <small style={{ color: '#888' }}>This will be used in URLs like /products?category=zebra</small>}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Menu Section</label>
                            <select 
                                name="section" 
                                value={newCategory.section} 
                                onChange={handleInputChange} 
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}
                            >
                                <option value="Shades">Shades (Main Menu)</option>
                                <option value="Smart Technology">Smart Technology</option>
                                <option value="None">None (Don't show in Menu)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Display Order</label>
                            <input 
                                type="number" 
                                name="order" 
                                value={newCategory.order} 
                                onChange={handleInputChange} 
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '35px', fontWeight: '500', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    name="isVisible" 
                                    checked={newCategory.isVisible} 
                                    onChange={(e) => setNewCategory(prev => ({ ...prev, isVisible: e.target.checked }))} 
                                    style={{ width: '20px', height: '20px' }}
                                />
                                Show in Navigation Menu
                            </label>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Image URL</label>
                            <input 
                                type="url" 
                                name="imageUrl" 
                                value={newCategory.imageUrl} 
                                onChange={handleInputChange} 
                                placeholder="https://..." 
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} 
                            />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                            <textarea 
                                name="description" 
                                value={newCategory.description} 
                                onChange={handleInputChange} 
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '80px' }}
                            ></textarea>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                                {isEditing ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Category List */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Image</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Section</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>ID/Slug</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>No categories found.</td></tr>
                        ) : (
                            categories.map(cat => (
                                <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', width: '80px' }}>
                                        {cat.imageUrl ? (
                                            <img src={cat.imageUrl} alt={cat.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><List size={20} color="#999" /></div>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: '600' }}>{cat.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{cat.description}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: '500' }}>{cat.section || 'Shades'}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{cat.id}</code>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => toggleVisibility(cat)}
                                            style={{ 
                                                padding: '4px 12px', 
                                                borderRadius: '12px', 
                                                fontSize: '0.75rem', 
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: cat.isVisible ? '#e8f5e9' : '#ffebee',
                                                color: cat.isVisible ? '#2e7d32' : '#c62828',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Click to toggle visibility in Navigation"
                                        >
                                            {cat.isVisible ? 'Visible' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <button onClick={() => handleEditClick(cat)} style={{ padding: '8px', background: 'none', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}><Pencil size={18} /></button>
                                            <button onClick={() => handleDeleteClick(cat.id)} style={{ padding: '8px', background: 'none', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', color: 'red' }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryManagement;
