
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

async function importJDXCatalog() {
    console.log("🚀 Starting JDX Catalog Import...");

    for (const product of jdxProducts) {
        const { id, ...data } = product;
        try {
            await setDoc(doc(db, "products", id), {
                ...data,
                updatedAt: new Date().toISOString()
            });
            console.log(`✅ Registered: ${data.title}`);
        } catch (error) {
            console.error(`❌ Failed to register ${data.title}:`, error);
        }
    }

    console.log("\n✨ JDX Catalog Import Complete!");
    process.exit(0);
}

importJDXCatalog();
