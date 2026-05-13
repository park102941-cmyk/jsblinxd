
import { db } from '../src/lib/firebase.js';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

async function deleteJunkProducts() {
  console.log('Cleaning up Firestore products...');
  const querySnapshot = await getDocs(collection(db, 'products'));
  let deletedCount = 0;
  
  for (const d of querySnapshot.docs) {
    const product = d.data();
    if (!product.title || !product.category) {
      console.log(`🗑️ Deleting junk product [ID: ${d.id}] - Title: ${product.title}, Category: ${product.category}`);
      await deleteDoc(doc(db, 'products', d.id));
      deletedCount++;
    }
  }
  
  console.log(`Cleaned up ${deletedCount} junk products.`);
  process.exit(0);
}

deleteJunkProducts();
