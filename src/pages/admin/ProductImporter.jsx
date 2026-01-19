import React, { useState } from 'react';
import { Package, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { addZshineZebraProducts } from '../../data/zshineZebraProducts.js';
import { addRollerProducts } from '../../data/rollerProducts.js';

const ProductImporter = () => {
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const deleteExistingProducts = async () => {
    if (!window.confirm('⚠️ 경고: 기존의 Zebra와 Roller Shade 제품을 모두 삭제합니다. 계속하시겠습니까?')) {
      return false;
    }

    setDeleting(true);
    setError(null);

    try {
      const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');

      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      let deletedCount = 0;
      const productIdsToDelete = [
        // Zebra products
        'zebra-manual-001',
        'zebra-motorized-001',
        'zebra-motorized-jacquard-001',
        // Roller products
        'roller-blackout-001',
        'roller-light-filtering-001',
        'roller-motorized-blackout-001',
        'roller-motorized-light-filtering-001',
        'roller-sheer-001'
      ];

      for (const docSnapshot of snapshot.docs) {
        if (productIdsToDelete.includes(docSnapshot.id)) {
          await deleteDoc(doc(db, 'products', docSnapshot.id));
          deletedCount++;
          console.log(`🗑️ Deleted: ${docSnapshot.id}`);
        }
      }

      console.log(`✅ Deleted ${deletedCount} existing products`);
      return true;
    } catch (err) {
      console.error('Error deleting products:', err);
      setError('제품 삭제 중 오류가 발생했습니다: ' + err.message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const importProducts = async () => {
    setImporting(true);
    setError(null);
    setResults(null);

    try {
      // First, delete existing products
      const deleteSuccess = await deleteExistingProducts();
      if (!deleteSuccess && error) {
        setImporting(false);
        return;
      }

      const allResults = {
        zebra: null,
        roller: null,
        totalAdded: 0
      };

      // Import Zebra Shades
      console.log('📦 Adding Zebra Shades...');
      const zebraResult = await addZshineZebraProducts();
      allResults.zebra = zebraResult;
      if (zebraResult.success) {
        allResults.totalAdded += zebraResult.products.length;
      }

      // Import Roller Shades
      console.log('📦 Adding Roller Shades...');
      const rollerResult = await addRollerProducts();
      allResults.roller = rollerResult;
      if (rollerResult.success) {
        allResults.totalAdded += rollerResult.products.length;
      }

      setResults(allResults);
    } catch (err) {
      console.error('Error importing products:', err);
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '40px',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <Package size={40} />
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>Product Importer</h1>
        </div>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
          Import Zebra and Roller Shade products to Firebase
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem' }}>
          Ready to Import
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#667eea' }}>
              Zebra Shades
            </h3>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>3 products</p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#666' }}>
              <li>Manual Light Filtering</li>
              <li>Motorized Standard</li>
              <li>Motorized Jacquard</li>
            </ul>
          </div>

          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#764ba2' }}>
              Roller Shades
            </h3>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>5 products</p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#666' }}>
              <li>Blackout (Manual & Motorized)</li>
              <li>Light Filtering (Manual & Motorized)</li>
              <li>Sheer</li>
            </ul>
          </div>
        </div>

        {/* Warning Message */}
        <div style={{
          background: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'start',
          gap: '12px'
        }}>
          <AlertCircle size={24} color="#856404" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '600', color: '#856404', marginBottom: '5px' }}>
              ⚠️ 중요 안내
            </div>
            <div style={{ fontSize: '0.9rem', color: '#856404', lineHeight: '1.5' }}>
              이 작업은 기존의 Zebra와 Roller Shade 제품을 <strong>삭제하고</strong> 새로운 제품으로 교체합니다. 
              제품 URL이 올바르게 작동하도록 하기 위해 필요한 과정입니다.
            </div>
          </div>
        </div>

        <button
          onClick={importProducts}
          disabled={importing}
          style={{
            width: '100%',
            padding: '16px',
            background: importing ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: importing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            boxShadow: importing ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          {importing ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Importing Products...
            </>
          ) : (
            <>
              <Upload size={20} />
              Import All Products
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          border: '2px solid #fcc',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <AlertCircle size={24} color="#c00" />
            <h3 style={{ margin: 0, color: '#c00' }}>Import Failed</h3>
          </div>
          <p style={{ margin: 0, color: '#666' }}>{error}</p>
        </div>
      )}

      {results && (
        <div style={{
          background: '#efe',
          border: '2px solid #cfc',
          borderRadius: '12px',
          padding: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <CheckCircle size={32} color="#0a0" />
            <h3 style={{ margin: 0, color: '#0a0', fontSize: '1.5rem' }}>
              Import Successful!
            </h3>
          </div>

          <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#333' }}>
            <strong>{results.totalAdded} products</strong> have been added to Firebase
          </p>

          {results.zebra && results.zebra.success && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#667eea', marginBottom: '10px' }}>
                ✅ Zebra Shades ({results.zebra.products.length})
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                {results.zebra.products.map((p, i) => (
                  <li key={i}>{p.title}</li>
                ))}
              </ul>
            </div>
          )}

          {results.roller && results.roller.success && (
            <div>
              <h4 style={{ color: '#764ba2', marginBottom: '10px' }}>
                ✅ Roller Shades ({results.roller.products.length})
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                {results.roller.products.map((p, i) => (
                  <li key={i}>{p.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ProductImporter;
