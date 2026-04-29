
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, collection, getDocs } from "firebase/firestore";

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

const productUpdates = {
    'zebra-manual-001': {
        imageUrl: '/images/aivision/zebra_shade_white_1777429360324.png',
        images: ['/images/aivision/zebra_shade_white_1777429360324.png']
    },
    'zebra-motorized-001': {
        imageUrl: '/images/aivision/zebra_shade_white_1777429360324.png',
        images: ['/images/aivision/zebra_shade_white_1777429360324.png']
    },
    'roller-blackout-001': {
        imageUrl: '/images/aivision/roller_shade_white_1777429322768.png',
        images: [
            '/images/aivision/roller_shade_white_1777429322768.png',
            '/images/aivision/roller_shade_grey_1777429334824.png',
            '/images/aivision/roller_shade_black_1777429348345.png'
        ]
    },
    'roller-light-filtering-001': {
        imageUrl: '/images/aivision/roller_shade_grey_1777429334824.png',
        images: ['/images/aivision/roller_shade_grey_1777429334824.png']
    },
    'roller-motorized-blackout-001': {
        imageUrl: '/images/aivision/roller_shade_black_1777429348345.png',
        images: ['/images/aivision/roller_shade_black_1777429348345.png']
    }
};

async function updateProducts() {
    console.log("Starting product image update...");
    
    for (const [id, data] of Object.entries(productUpdates)) {
        try {
            const docRef = doc(db, "products", id);
            await updateDoc(docRef, data);
            console.log(`✅ Updated product ${id}`);
        } catch (error) {
            console.error(`❌ Failed to update product ${id}:`, error.message);
        }
    }
    
    console.log("Update complete!");
    process.exit(0);
}

updateProducts();
