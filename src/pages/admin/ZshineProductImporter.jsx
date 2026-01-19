import React, { useState } from 'react';
import { addZshineZebraProducts, calculateZebraPrice } from '../../data/zshineZebraProducts';
import zshineData from '../../data/zshineZebraProducts';
import { Package, DollarSign, Ruler, Palette, Zap, CheckCircle, AlertCircle } from 'lucide-react';

const ZshineProductImporter = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 48, height: 72 });
  const [previewOptions, setPreviewOptions] = useState({});

  const products = zshineData.products;
  const currentProduct = products[selectedProduct];

  const handleImport = async () => {
    setImporting(true);
    setResult(null);

    try {
      const importResult = await addZshineZebraProducts();
      setResult(importResult);
    } catch (error) {
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  const calculatePreviewPrice = () => {
    return calculateZebraPrice(
      currentProduct,
      previewDimensions.width,
      previewDimensions.height,
      previewOptions
    );
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '10px' }}>
        <Package size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
        ZSHINE Zebra Shades 제품 가져오기
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        ZSHINE의 Zebra Roller Shades 3개 제품을 Firebase에 추가합니다.
      </p>

      {/* Import Button */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>제품 가져오기</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          다음 3개 제품이 Firebase에 추가됩니다:
        </p>
        <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
          {products.map((product, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              <strong>{product.title}</strong> - ${product.basePrice}부터
            </li>
          ))}
        </ul>

        <button
          onClick={handleImport}
          disabled={importing}
          className="hover-lift"
          style={{
            padding: '12px 30px',
            background: importing ? '#ccc' : 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: importing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {importing ? (
            <>
              <div className="spinner" style={{
                width: '20px',
                height: '20px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              가져오는 중...
            </>
          ) : (
            <>
              <Package size={20} />
              제품 가져오기
            </>
          )}
        </button>

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '8px',
            background: result.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
            color: result.success ? '#155724' : '#721c24',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {result.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <div>
              <strong>{result.success ? '성공!' : '오류'}</strong>
              <p style={{ margin: '5px 0 0 0' }}>{result.message}</p>
              {result.products && (
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {result.products.map((p, i) => (
                    <li key={i}>{p.title} (ID: {p.id})</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Preview */}
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>제품 미리보기 및 가격 계산기</h2>

        {/* Product Selector */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
            제품 선택:
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(Number(e.target.value));
              setPreviewOptions({});
            }}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            {products.map((product, index) => (
              <option key={index} value={index}>
                {product.title} - ${product.basePrice}부터
              </option>
            ))}
          </select>
        </div>

        {/* Product Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Basic Info */}
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} />
              기본 정보
            </h3>
            <p><strong>카테고리:</strong> {currentProduct.category}</p>
            <p><strong>기본 가격:</strong> ${currentProduct.basePrice}</p>
            <p><strong>모터:</strong> {currentProduct.showMotor ? '전동' : '수동'}</p>
            <p><strong>재고:</strong> {currentProduct.inStock ? '있음' : '없음'}</p>
          </div>

          {/* Size Range */}
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ruler size={20} />
              사이즈 범위
            </h3>
            <p><strong>가로:</strong> {currentProduct.minWidth}" - {currentProduct.maxWidth}"</p>
            <p><strong>세로:</strong> {currentProduct.minHeight}" - {currentProduct.maxHeight}"</p>
            <p><strong>가격 비율:</strong> ${currentProduct.sizeRatio}/sq in</p>
          </div>

          {/* Colors */}
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={20} />
              색상 옵션
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentProduct.colors.map((color, index) => (
                <div
                  key={index}
                  title={color.name}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: color.hex,
                    border: '2px solid #ddd',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
              {currentProduct.colors.length}개 색상 사용 가능
            </p>
          </div>
        </div>

        {/* Price Calculator */}
        <div style={{
          padding: '25px',
          background: '#e8f5e9',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={24} />
            가격 계산기
          </h3>

          {/* Dimensions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                가로 (inches):
              </label>
              <input
                type="number"
                min={currentProduct.minWidth}
                max={currentProduct.maxWidth}
                value={previewDimensions.width}
                onChange={(e) => setPreviewDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                세로 (inches):
              </label>
              <input
                type="number"
                min={currentProduct.minHeight}
                max={currentProduct.maxHeight}
                value={previewDimensions.height}
                onChange={(e) => setPreviewDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Motor Options (if motorized) */}
          {currentProduct.motorOptions && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                <Zap size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                모터 옵션:
              </label>
              <select
                value={previewOptions.motor || ''}
                onChange={(e) => setPreviewOptions(prev => ({ ...prev, motor: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="">선택하세요</option>
                {currentProduct.motorOptions.map((option, index) => (
                  <option key={index} value={option.name}>
                    {option.name} {option.price > 0 ? `(+$${option.price})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Remote Options (if motorized) */}
          {currentProduct.remoteOptions && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                리모컨 옵션:
              </label>
              <select
                value={previewOptions.remote || ''}
                onChange={(e) => setPreviewOptions(prev => ({ ...prev, remote: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="">선택하세요</option>
                {currentProduct.remoteOptions.map((option, index) => (
                  <option key={index} value={option.name}>
                    {option.name} {option.price > 0 ? `(+$${option.price})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Control Options (if manual) */}
          {currentProduct.controlOptions && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                조작 방식:
              </label>
              <select
                value={previewOptions.control || ''}
                onChange={(e) => setPreviewOptions(prev => ({ ...prev, control: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="">선택하세요</option>
                {currentProduct.controlOptions.map((option, index) => (
                  <option key={index} value={option.name}>
                    {option.name} {option.price > 0 ? `(+$${option.price})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Calculated Price */}
          <div style={{
            marginTop: '25px',
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>예상 가격</p>
            <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-green)' }}>
              ${calculatePreviewPrice()}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
              {previewDimensions.width}" × {previewDimensions.height}" = {previewDimensions.width * previewDimensions.height} sq in
            </p>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>주요 특징</h3>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {currentProduct.features.map((feature, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="var(--primary-green)" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ZshineProductImporter;
