
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

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

async function stripZshine() {
    console.log("Stripping 'ZSHINE' from all products...");
    const snapshot = await getDocs(collection(db, "products"));
    
    let updateCount = 0;
    for (const d of snapshot.docs) {
        const data = d.data();
        let changed = false;
        let newTitle = data.title;
        let newName = data.name;

        if (newTitle && (newTitle.includes("ZSHINE™") || newTitle.includes("ZSHINE"))) {
            newTitle = newTitle.replace(/ZSHINE™/g, "").replace(/ZSHINE/g, "").trim();
            changed = true;
        }
        if (newName && (newName.includes("ZSHINE™") || newName.includes("ZSHINE"))) {
            newName = newName.replace(/ZSHINE™/g, "").replace(/ZSHINE/g, "").trim();
            changed = true;
        }

        if (changed) {
            console.log(`Updating ${d.id}: "${data.title}" -> "${newTitle}"`);
            await updateDoc(doc(db, "products", d.id), {
                title: newTitle,
                name: newName
            });
            updateCount++;
        }
    }
    console.log(`✅ Stripped 'ZSHINE' from ${updateCount} products.`);
}

stripZshine().catch(console.error);
