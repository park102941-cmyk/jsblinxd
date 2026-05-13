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
    console.log("Fetching all products from Firestore...");
    const q = collection(db, "products");
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} products:`);
    querySnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}, Title: ${data.title}, Category: ${data.category}`);
    });
    
    process.exit(0);
}

listProducts();
