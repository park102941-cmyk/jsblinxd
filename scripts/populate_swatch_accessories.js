import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, query, where } from "firebase/firestore";

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

async function populateSwatches() {
    console.log("Starting swatch accessory registration script...");
    
    // 1. Fetch all products
    const productsSnap = await getDocs(collection(db, "products"));
    const allProducts = [];
    productsSnap.forEach(d => {
        allProducts.push({ id: d.id, ...d.data() });
    });

    console.log(`Fetched ${allProducts.length} products total.`);

    // 2. Identify fabrics
    const fabrics = allProducts.filter(p => {
        const cat = (p.category || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        return (
            cat.includes("zebra") || cat.includes("roller") ||
            title.includes("zebra") || title.includes("roller")
        ) && !title.includes("[swatch]"); // exclude existing swatches if any
    });

    console.log(`Found ${fabrics.length} fabric collection products in database.`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const fabric of fabrics) {
        const swatchTitle = `[Swatch] ${fabric.title}`;
        
        // Check if this swatch already exists
        const exists = allProducts.some(p => p.title === swatchTitle);
        if (exists) {
            console.log(`- Swatch "${swatchTitle}" already exists. Skipping.`);
            skippedCount++;
            continue;
        }

        // Determine category: swatch-zebra or swatch-roller
        const cat = (fabric.category || "").toLowerCase();
        const title = (fabric.title || "").toLowerCase();
        const swatchCategory = (cat.includes("zebra") || title.includes("zebra")) ? "swatch-zebra" : "swatch-roller";

        // Register swatch product as an accessory flat-rate product
        const swatchData = {
            title: swatchTitle,
            category: swatchCategory,
            price: 9.99,
            basePrice: 9.99,
            imageUrl: fabric.imageUrl || fabric.image || "",
            image: fabric.imageUrl || fabric.image || "",
            colors: fabric.colors || [],
            isStandalone: true,
            showMotor: false,
            showColor: true,
            sizeRatio: 0,
            minWidth: 0,
            maxWidth: 0,
            minHeight: 0,
            maxHeight: 0,
            description: `Sample fabric swatch for ${fabric.title}. Experience the premium texture, transparency and color in your own space before customizing.`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "products"), swatchData);
        console.log(`+ Registered swatch: "${swatchTitle}" with ID: ${docRef.id} in category "${swatchCategory}"`);
        addedCount++;
    }

    console.log("\nScript completed successfully!");
    console.log(`Summary: Registered ${addedCount} new swatches, skipped ${skippedCount} existing.`);
}

populateSwatches().catch(console.error);
