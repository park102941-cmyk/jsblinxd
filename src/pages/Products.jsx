import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductListing from '../components/ProductListing';
import ProductCard from '../components/ProductCard';

const Products = () => {
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const minPrice = Number(searchParams.get('minPrice') || 0);
    const maxPrice = Number(searchParams.get('maxPrice') || 1000);
    const opacityParam = searchParams.get('opacity') || '';
    const selectedOpacities = useMemo(() => opacityParam ? opacityParam.split(',') : [], [opacityParam]);

    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let q = collection(db, "products");
                const querySnapshot = await getDocs(q);
                let fetchedProducts = (querySnapshot.docs || []).map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(p => !p.isHidden && !p.category?.toLowerCase().startsWith('swatch') && !p.title?.startsWith('[Swatch]'));

                setAllProducts(fetchedProducts);

                // Fetch categories to get title
                const catSnap = await getDocs(collection(db, "categories"));
                const catList = (catSnap.docs || []).map(doc => ({ id: doc.id, ...doc.data() }));
                setCategories(catList);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Local client-side filtering based on all search params
    const filteredProducts = useMemo(() => {
        let filtered = [...allProducts];

        // 1. Category Filter
        if (categoryFilter) {
            filtered = filtered.filter(p => {
                const productCategory = p.category?.toLowerCase() || '';
                let filter = categoryFilter.toLowerCase();
                if (filter === 'accessories') filter = 'motor';
                return productCategory === filter || productCategory.includes(filter);
            });
        }

        // 2. Price Range Filter
        filtered = filtered.filter(p => {
            const price = p.basePrice !== undefined ? p.basePrice : (p.price || 0);
            if (maxPrice >= 1000) {
                return price >= minPrice;
            }
            return price >= minPrice && price <= maxPrice;
        });

        // 3. Opacity Filter
        if (selectedOpacities.length > 0) {
            filtered = filtered.filter(p => {
                const titleLower = p.title?.toLowerCase() || '';
                const descLower = p.description?.toLowerCase() || '';
                const tags = Array.isArray(p.tags) ? p.tags.map(t => t.toLowerCase()) : [];

                return selectedOpacities.some(op => {
                    if (op === 'blackout') {
                        return tags.includes('blackout') || titleLower.includes('blackout') || descLower.includes('blackout');
                    }
                    if (op === 'light-filtering') {
                        return tags.includes('light-filtering') || tags.includes('light filtering') || titleLower.includes('light filtering') || descLower.includes('light filtering') || titleLower.includes('light-filtering') || descLower.includes('light-filtering');
                    }
                    if (op === 'sheer') {
                        return tags.includes('sheer') || titleLower.includes('sheer') || descLower.includes('sheer');
                    }
                    if (op === 'sunscreen') {
                        return tags.includes('sunscreen') || titleLower.includes('sunscreen') || descLower.includes('sunscreen');
                    }
                    return false;
                });
            });
        }

        return filtered;
    }, [allProducts, categoryFilter, minPrice, maxPrice, selectedOpacities]);

    // Extended Title Mapping for Smartwings Variety
    const getPageTitle = () => {
        const lowerFilter = categoryFilter?.toLowerCase();
        if (lowerFilter === 'motor' || lowerFilter === 'accessories') return 'Accessories';

        const foundCategory = categories.find(c => c.id === lowerFilter);
        if (foundCategory) return foundCategory.name;

        const titles = {
            'zebra': 'Zebra Shades',
            'roller': 'Roller Shades'
        };
        return titles[lowerFilter] || 'All Collections';
    };

    const breadcrumbs = ["Collection", getPageTitle()];

    const extractColorImages = (colors) => {
        if (!Array.isArray(colors)) return [];
        return colors.map(c => typeof c === 'string' ? c : (c.image || c.hex));
    };

    const productCards = useMemo(() => {
        return filteredProducts.map(product => (
            <ProductCard
                key={product.id}
                id={product.id}
                title={product.title || 'Untitled Product'}
                price={product.basePrice !== undefined ? product.basePrice : (product.price || 0)}
                image={product.imageUrl || product.image}
                badge={product.badge || (product.category === 'motor' ? 'Smart' : null)}
                reviews={product.reviews || 0}
                colors={product.showColor !== false ? extractColorImages(product.colors) : []}
            />
        ));
    }, [filteredProducts]);

    if (loading) return (
        <div className="loading-overlay">
            <div className="loader"></div>
        </div>
    );

    return (
        <ProductListing
            title={getPageTitle()}
            categories={categories}
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
