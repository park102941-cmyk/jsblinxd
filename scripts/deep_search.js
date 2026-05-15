
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

// Note: In Firestore Web SDK, you can't easily list all collections.
// But we can check common names or names used in the code.
// Or we can try to find where "Nex-Doors" is mentioned in the database values.

async function deepSearch() {
    const collectionsToCheck = ["products", "siteContent", "categories", "orders", "users"];
    
    for (const colName of collectionsToCheck) {
        console.log(`Checking collection: ${colName}`);
        const snap = await getDocs(collection(db, colName));
        snap.forEach(d => {
            const data = JSON.stringify(d.data()).toLowerCase();
            if (data.includes("nex") || data.includes("glass") || data.includes("door")) {
                console.log(`MATCH FOUND in ${colName} | Doc ID: ${d.id}`);
                console.log(`Data: ${JSON.stringify(d.data())}`);
            }
        });
    }
}

deepSearch().catch(console.error);
