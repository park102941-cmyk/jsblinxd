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
            containerType: 'inline-size',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            padding: '4cqw',
            boxSizing: 'border-box',
            position: 'relative'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4cqw', zIndex: 2 }}>
                <div style={{ 
                    backgroundColor: '#d9d9d9', 
                    padding: '1.5cqw 4cqw', 
                    fontWeight: 'bold', 
                    fontSize: '3cqw',
                    letterSpacing: '0.2cqw'
                }}>
                    {collectionName || 'COLLECTION'}
                </div>
                <div style={{ 
                    textAlign: 'right', 
                    fontSize: '4.5cqw', 
                    fontWeight: '300',
                    lineHeight: '1.1',
                    letterSpacing: '0.4cqw',
                    whiteSpace: 'pre-line',
                    color: '#333'
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
                                width: '18cqw',
                                height: '18cqw',
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
                        backgroundPosition: 'center',
                        borderRadius: '1cqw'
                    }} />
                    <div style={{
                        marginTop: '3cqw',
                        textAlign: 'right',
                        fontSize: '2cqw',
                        fontWeight: '600',
                        letterSpacing: '0.2cqw',
                        color: '#444'
                    }}>
                        COLOR: {colorNames}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCoverSlide;
