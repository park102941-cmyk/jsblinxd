
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

async function checkHomeData() {
    const homeRef = doc(db, "siteContent", "home");
    const snap = await getDoc(homeRef);
    if (snap.exists()) {
        console.log("Home Data in Firestore:");
        console.log(JSON.stringify(snap.data(), null, 2));
    }
}

checkHomeData().catch(console.error);
