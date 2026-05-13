
import { db } from '../src/lib/firebase.js';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { jdxProducts } from '../src/data/jdxProducts.js';

async function syncImages() {
  console.log('Starting JDX Image Sync...');
  
  for (const product of jdxProducts) {
    try {
      const productRef = doc(db, "products", product.id);
      const docSnap = await getDocs(query(collection(db, "products"), where("__name__", "==", product.id)));
      
      if (docSnap.empty) {
        console.log(`Product ${product.id} not found in Firestore.`);
        continue;
      }
      
      await updateDoc(productRef, {
        imageUrl: product.imageUrl,
        images: product.images || [product.imageUrl]
      });
      
      console.log(`Updated images for: ${product.title}`);
    } catch (error) {
      console.error(`Error updating ${product.id}:`, error);
    }
  }
  
  console.log('JDX Image Sync Complete!');
  process.exit(0);
}

syncImages();
