import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { jdxProducts } from "../src/data/jdxProducts.js";

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

async function uploadJdxProducts() {
    console.log("Starting JDX Catalog product upload...");

    for (const p of jdxProducts) {
        const { id, ...data } = p;
        try {
            await setDoc(doc(db, "products", id), data);
            console.log(`✨ Added JDX product: ${data.title} (${id})`);
        } catch (error) {
            console.error(`❌ Error adding product ${id}:`, error);
        }
    }

    console.log("JDX product upload complete!");
    process.exit(0);
}

uploadJdxProducts();
