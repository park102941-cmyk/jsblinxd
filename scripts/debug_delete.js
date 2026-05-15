
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

async function checkAndClean() {
    console.log("Checking products...");
    const snapshot = await getDocs(collection(db, "products"));
    console.log(`Found ${snapshot.size} products.`);
    
    for (const d of snapshot.docs) {
        const data = d.data();
        console.log(`- ${d.id}: ${data.title}`);
        
        // Check for the specific product the user wants to delete
        if (data.title && data.title.includes("ZSHINE™ Motorized Luxury Pergola")) {
            console.log(`Found target product. Attempting to delete ${d.id}...`);
            try {
                await deleteDoc(doc(db, "products", d.id));
                console.log("SUCCESS: Deleted " + d.id);
            } catch (e) {
                console.error("FAILURE: Could not delete " + d.id, e.message);
            }
        }
    }
}

checkAndClean().catch(console.error);
