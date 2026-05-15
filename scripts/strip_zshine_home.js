
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

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

async function stripZshineFromHome() {
    console.log("Stripping 'ZSHINE' from Home Page content in Firestore...");
    const homeRef = doc(db, "siteContent", "home");
    const snap = await getDoc(homeRef);
    
    if (snap.exists()) {
        let data = JSON.stringify(snap.data());
        if (data.includes("ZSHINE™") || data.includes("ZSHINE")) {
            const newData = JSON.parse(data.replace(/ZSHINE™/g, "").replace(/ZSHINE/g, ""));
            await updateDoc(homeRef, newData);
            console.log("✅ Home content updated.");
        } else {
            console.log("No ZSHINE found in home content.");
        }
    }
}

stripZshineFromHome().catch(console.error);
