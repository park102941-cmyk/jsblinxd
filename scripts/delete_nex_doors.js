
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

async function deleteSpecificProduct() {
    console.log("Searching for Nex-Doors product...");
    const snapshot = await getDocs(collection(db, "products"));
    
    let found = false;
    for (const d of snapshot.docs) {
        const data = d.data();
        if (data.title && data.title.includes("Nex-Doors")) {
            console.log(`Found: ${d.id} (${data.title}). Deleting...`);
            await deleteDoc(doc(db, "products", d.id));
            console.log("✅ Successfully deleted.");
            found = true;
        }
    }
    
    if (!found) {
        console.log("❌ Product not found.");
    }
}

deleteSpecificProduct().catch(console.error);
