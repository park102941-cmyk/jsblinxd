import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDRIp_aSNlExpOgLmybyd8KBEVgIAYVFh4",
    authDomain: "jsblind.firebaseapp.com",
    projectId: "jsblind",
    storageBucket: "jsblind.firebasestorage.app",
    messagingSenderId: "556853185028",
    appId: "1:556853185028:web:ef335f8ef5048c7256c351",
    measurementId: "G-2TRJY0TC5D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearGalleryCollection() {
    console.log("Fetching all documents from 'gallery_items' collection...");
    const snapshot = await getDocs(collection(db, "gallery_items"));
    
    if (snapshot.empty) {
        console.log("No items found in 'gallery_items' collection.");
        return;
    }
    
    console.log(`Found ${snapshot.size} items to delete.`);
    
    for (const d of snapshot.docs) {
        console.log(`Deleting lookbook photo document: ${d.id}...`);
        await deleteDoc(doc(db, "gallery_items", d.id));
    }
    
    console.log("✅ All gallery_items documents successfully deleted from Firestore!");
}

clearGalleryCollection().catch(console.error);
