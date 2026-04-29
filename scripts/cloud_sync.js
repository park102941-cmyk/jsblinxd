
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from "fs";
import path from "path";

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
const storage = getStorage(app);

const imageDir = "./public/images/ai";

async function uploadAndSync() {
    console.log("🚀 Starting AI Image Cloud Sync...");
    
    const files = fs.readdirSync(imageDir).filter(f => f.endsWith(".png"));
    const urlMap = {};

    for (const file of files) {
        try {
            const filePath = path.join(imageDir, file);
            const fileBuffer = fs.readFileSync(filePath);
            const storageRef = ref(storage, `ai-products/${file}`);
            
            console.log(`📤 Uploading ${file}...`);
            const snapshot = await uploadBytes(storageRef, fileBuffer, { contentType: "image/png" });
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            urlMap[file] = downloadURL;
            console.log(`✅ Uploaded: ${downloadURL}`);
        } catch (error) {
            console.error(`❌ Failed to upload ${file}:`, error.message);
        }
    }

    console.log("\n🔄 Updating Firestore database with Cloud URLs...");

    // Update specific product mappings
    const productMappings = {
        'zebra-manual-001': 'zebra_shade_white_1777429360324.png',
        'zebra-motorized-001': 'zebra_shade_white_1777429360324.png',
        'roller-blackout-001': 'roller_shade_white_1777429322768.png',
        'roller-light-filtering-001': 'roller_shade_grey_1777429334824.png',
        'roller-motorized-blackout-001': 'roller_shade_black_1777429348345.png',
        'nex-doors-bifold-001': 'glass_doors_premium_1777429374604.png',
        'pergola-motorized-001': 'pergola_outdoor_tech_1777429388159.png'
    };

    for (const [productId, fileName] of Object.entries(productMappings)) {
        if (urlMap[fileName]) {
            try {
                const docRef = doc(db, "products", productId);
                await updateDoc(docRef, {
                    imageUrl: urlMap[fileName],
                    images: [urlMap[fileName]]
                });
                console.log(`✅ Synced ${productId} -> ${fileName}`);
            } catch (e) {
                console.error(`❌ Failed to sync ${productId}:`, e.message);
            }
        }
    }

    console.log("\n✨ Cloud Sync Complete! All products now use absolute Storage URLs.");
    process.exit(0);
}

uploadAndSync();
