
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

async function findByPrice() {
    console.log("Searching for products with price 2450...");
    const snapshot = await getDocs(collection(db, "products"));
    
    let found = false;
    for (const d of snapshot.docs) {
        const data = d.data();
        if (data.price === 2450 || data.basePrice === 2450 || data.price === "2450") {
            console.log(`Found matching product by price: ${d.id} | Title: ${data.title || data.name}. Deleting...`);
            await deleteDoc(doc(db, "products", d.id));
            found = true;
        }
    }
    
    if (!found) {
        console.log("❌ No products with price 2450 found.");
    }
}

findByPrice().catch(console.error);
