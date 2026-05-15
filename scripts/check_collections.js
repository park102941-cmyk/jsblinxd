
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

async function checkOtherCollections() {
    console.log("Checking categories collection:");
    const cats = await getDocs(collection(db, "categories"));
    cats.forEach(d => console.log(`- ${d.id}: ${d.data().name}`));

    console.log("\nChecking siteContent collection:");
    const content = await getDocs(collection(db, "siteContent"));
    content.forEach(d => console.log(`- ${d.id}`));
}

checkOtherCollections().catch(console.error);
