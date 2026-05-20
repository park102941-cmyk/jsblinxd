import React from 'react';

const ProductCoverSlide = ({ product, overrideMainImage }) => {
    if (!product) return null;

    // Extract collection name from title
    let collectionName = product.title.toUpperCase();
    if (collectionName.includes('ROLLER')) collectionName = collectionName.split('ROLLER')[0].trim();
    if (collectionName.includes('ZEBRA')) collectionName = collectionName.split('ZEBRA')[0].trim();
    if (collectionName.includes('SHADES')) collectionName = collectionName.split('SHADES')[0].trim();

    // Determine type
    const isZebra = product.category === 'zebra' || product.title.toLowerCase().includes('zebra');
    const productType = isZebra ? 'ZEBRA\nSHADES' : 'ROLLER\nSHADES';

    // Get color choices
    const colorOption = product.options?.find(o => o.id === 'color') || product.colors;
    const colorChoices = colorOption?.choices || colorOption || [];
    const displayColors = colorChoices.slice(0, 4);
    const colorNames = displayColors.map(c => (c.name || c.value || '').toUpperCase()).join(', ');

    // Main image
    const mainImage = overrideMainImage || product.images?.[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800';

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff'
        }}>
            <div style={{
                containerType: 'inline-size',
                height: '100%',
                aspectRatio: '2/3', // Force portrait aspect ratio to match reference
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                padding: '4cqw',
                boxSizing: 'border-box',
                position: 'relative',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4cqw', zIndex: 2 }}>
                    <div style={{ 
                        backgroundColor: '#ebd0c0', // Beige color from reference
                        padding: '1.5cqw 4cqw', 
                        fontWeight: 'bold', 
                        fontSize: '3.5cqw',
                        letterSpacing: '0.1cqw',
                        color: '#000'
                    }}>
                        {collectionName || 'COLLECTION'}
                    </div>
                    <div style={{ 
                        textAlign: 'right', 
                        fontSize: '5.5cqw', 
                        fontFamily: '"Times New Roman", Times, serif', // Serif font from reference
                        lineHeight: '1',
                        letterSpacing: '0.2cqw',
                        whiteSpace: 'pre-line',
                        color: '#222'
                    }}>
                        {productType}
                    </div>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', flex: 1, gap: '4cqw', minHeight: 0 }}>
                    {/* Swatches Column */}
                    <div style={{ 
                        width: '30%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '2cqw 0'
                    }}>
                        {displayColors.map((color, idx) => {
                            let swatchImg = color.image || color.img;
                            if (!swatchImg && product.images && product.images.length > 0) {
                                const cName = (color.name || color.value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                                if (cName) {
                                    swatchImg = product.images.find(img => img.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cName));
                                }
                            }
                            
                            return (
                                <div key={idx} style={{
                                    width: '20cqw',
                                    height: '20cqw',
                                    borderRadius: '50%',
                                    backgroundImage: swatchImg ? `url(${swatchImg})` : 'none',
                                    backgroundColor: color.hex || '#ccc',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    boxShadow: '0 1cqw 2cqw rgba(0,0,0,0.1)'
                                }} />
                            );
                        })}
                    </div>

                    {/* Main Image Column */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            flex: 1,
                            backgroundImage: `url(${mainImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                        <div style={{
                            marginTop: '2cqw',
                            textAlign: 'right',
                            fontSize: '2.2cqw',
                            fontWeight: '600',
                            letterSpacing: '0.1cqw',
                            color: '#333'
                        }}>
                            COLOR : {colorNames}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCoverSlide;
