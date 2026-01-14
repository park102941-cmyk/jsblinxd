import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [infoResults, setInfoResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                // 1. Search Products
                const productsRef = collection(db, "products");
                const productSnaps = await getDocs(productsRef);
                const allProducts = productSnaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const filteredProducts = allProducts.filter(p =>
                    p.title.toLowerCase().includes(query.toLowerCase()) ||
                    p.category?.toLowerCase().includes(query.toLowerCase())
                );
                setProducts(filteredProducts);

                // 2. Search Info (Static for now, could be dynamic if we fetch content pages)
                // Fetch FAQ content to search
                const faqRef = collection(db, "content_pages");
                const faqSnaps = await getDocs(faqRef);
                let foundInfos = [];

                faqSnaps.forEach(doc => {
                    if (doc.id === 'faq') {
                        const faqs = doc.data().items || [];
                        const matchedFaqs = faqs.filter(f =>
                            f.question.toLowerCase().includes(query.toLowerCase()) ||
                            f.answer.toLowerCase().includes(query.toLowerCase())
                        );
                        if (matchedFaqs.length > 0) {
                            foundInfos.push({
                                type: 'FAQ',
                                title: `Found in FAQs (${matchedFaqs.length} matches)`,
                                link: '/support',
                                snippet: matchedFaqs[0].question
                            });
                        }
                    }
                    if (doc.id === 'about_us') {
                        const data = doc.data();
                        if (
                            data.heroTitle?.toLowerCase().includes(query.toLowerCase()) ||
                            data.introText?.toLowerCase().includes(query.toLowerCase())
                        ) {
                            foundInfos.push({
                                type: 'Page',
                                title: 'About Us Page',
                                link: '/about-us',
                                snippet: data.introText?.substring(0, 100) + '...'
                            });
                        }
                    }
                });

                setInfoResults(foundInfos);

            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
            <h1 style={{ marginBottom: '30px' }}>Search Results for "{query}"</h1>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {/* Info Results */}
                    {infoResults.length > 0 && (
                        <div style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Information & Pages</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {infoResults.map((info, idx) => (
                                    <div key={idx} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>
                                            <Link to={info.link} style={{ color: 'var(--secondary-color)' }}>{info.title}</Link>
                                        </h3>
                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{info.snippet}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product Results */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Products ({products.length})</h2>
                        {products.length === 0 ? (
                            <p>No products found matching your search.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                                {products.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        title={product.title}
                                        price={product.basePrice}
                                        image={product.imageUrl}
                                        badge={product.badge}
                                        reviews={product.reviews}
                                        questions={product.questions}
                                        colors={product.colors && product.showColor !== false ? product.colors.map(c => c.image || c.hex || c) : []}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {products.length === 0 && infoResults.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
                            No results found. Try checking your spelling or using different keywords.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Search;
