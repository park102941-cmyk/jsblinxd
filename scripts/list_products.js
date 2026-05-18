
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function listProducts() {
    console.log("Listing all products in Firestore:");
    const snapshot = await getDocs(collection(db, "products"));
    snapshot.forEach(d => {
        const data = d.data();
        console.log(`- Title: ${data.title} | BasePrice: ${data.basePrice} | Price: ${data.price} | Category: ${data.category}`);
    });
}

listProducts().catch(console.error);
