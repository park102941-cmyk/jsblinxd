
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

async function findAndDeleteGlassDoors() {
    console.log("Searching for any products related to Glass Doors...");
    const snapshot = await getDocs(collection(db, "products"));
    
    let found = false;
    for (const d of snapshot.docs) {
        const data = d.data();
        const title = (data.title || data.name || "").toLowerCase();
        if (title.includes("glass") || title.includes("door") || title.includes("nex")) {
            console.log(`Found matching product: ${d.id} | Title: ${data.title || data.name}. Deleting...`);
            await deleteDoc(doc(db, "products", d.id));
            found = true;
        }
    }
    
    if (!found) {
        console.log("❌ No matching products found in 'products' collection.");
    }
}

findAndDeleteGlassDoors().catch(console.error);
