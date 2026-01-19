import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductListing from '../components/ProductListing';
import ProductCard from '../components/ProductCard';

const Products = () => {
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let q = collection(db, "products");
                const querySnapshot = await getDocs(q);
                let fetchedProducts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (categoryFilter) {
                    fetchedProducts = fetchedProducts.filter(p => {
                        const productCategory = p.category?.toLowerCase() || '';
                        const filter = categoryFilter.toLowerCase();
                        // Support both exact match and partial match
                        // e.g., "zebra" matches "Zebra Shades"
                        return productCategory === filter || productCategory.includes(filter);
                    });
                }

                setProducts(fetchedProducts);

                // Fetch categories to get title
                const catSnap = await getDocs(collection(db, "categories"));
                const catList = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(catList);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryFilter]);

    // Extended Title Mapping for Smartwings Variety
    const getPageTitle = () => {
        const foundCategory = categories.find(c => c.id === categoryFilter?.toLowerCase());
        if (foundCategory) return foundCategory.name;

        const titles = {
            'zebra': 'Zebra Shades',
            'roller': 'Roller Shades',
            'cellular': 'Cellular Shades',
            'roman': 'Roman Shades',
            'woven': 'Woven Wood Shades',
            'motor': 'Motorized Blinds',
            'curtains': 'Smart Curtains',
            'wood': 'Wood Blinds',
            'faux': 'Faux Wood Blinds',
            'outdoor': 'Outdoor Shades',
            'dual': 'Dual Shades',
            'matter': 'Matter & Thread Tech',
            'homekit': 'Apple HomeKit Blinds'
        };
        return titles[categoryFilter?.toLowerCase()] || 'All Collections';
    };

    const breadcrumbs = ["Collection", getPageTitle()];

    const extractColorImages = (colors) => {
        if (!Array.isArray(colors)) return [];
        return colors.map(c => typeof c === 'string' ? c : (c.image || c.hex));
    };

    const productCards = products.map(product => (
        <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.basePrice}
            image={product.imageUrl}
            badge={product.badge || (product.category === 'motor' ? 'Smart' : null)}
            reviews={product.reviews || 0}
            colors={product.showColor !== false ? extractColorImages(product.colors) : []}
        />
    ));

    if (loading) return (
        <div className="loading-overlay">
            <div className="loader"></div>
        </div>
    );

    return (
        <ProductListing
            title={getPageTitle()}
            products={productCards.length > 0 ? productCards : (
                <div style={{ 
                    gridColumn: '1 / -1',
                    padding: '60px 40px', 
                    textAlign: 'center', 
                    fontSize: '1rem', 
                    color: '#86868b', 
                    fontWeight: '400' 
                }}>
                    No products found in this collection.
                    <br/>
                    <Link 
                        to="/products" 
                        style={{ 
                            color: 'var(--primary-green)', 
                            textDecoration: 'none', 
                            marginTop: '16px', 
                            display: 'inline-block',
                            fontWeight: '500'
                        }}
                    >
                        View All Products →
                    </Link>
                </div>
            )}
            breadcrumbs={breadcrumbs}
        />
    );
};

export default Products;
