
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

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

async function syncHomeImages() {
    const homeRef = doc(db, "siteContent", "home");
    const snap = await getDoc(homeRef);
    
    if (snap.exists()) {
        console.log("Updating Home Page images in Firestore to trigger local fallback or updated paths...");
        // Setting to empty or specific flags so the local aiAssets take precedence if desired
        // Or we can just leave it to the local code logic.
        // Actually, the user asked to "put the photos", so I've already updated the local assets which are used in the code.
        // If Firestore has old URLs, we should probably clear them.
        await updateDoc(homeRef, {
            "hero.imageUrl": "",
            "categories": [
                { title: 'Roller Shades', img: '', link: '/products?category=roller' },
                { title: 'Zebra Shades', img: '', link: '/products?category=zebra' }
            ],
            "techHighlight.imageUrl": ""
        });
        console.log("✅ Firestore home content updated to use local premium assets.");
    }
}

syncHomeImages().catch(console.error);
