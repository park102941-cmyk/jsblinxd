
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, deleteDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";

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

async function finalCleanup() {
    console.log("Starting final cleanup and sync...");

    // 1. Delete Junk
    const junkIds = ['GY6rNHtRHttZ0VWZ60fZ', 'PUZVndQ0qVowyYBJjwOg'];
    for (const id of junkIds) {
        try {
            await deleteDoc(doc(db, "products", id));
            console.log(`🗑️ Deleted junk product: ${id}`);
        } catch (e) {}
    }

    // 2. Update existing products with new AI images
    const productsSnap = await getDocs(collection(db, "products"));
    for (const d of productsSnap.docs) {
        const product = d.data();
        let update = {};

        if (product.category === 'Roller Shades' || product.title.toLowerCase().includes('roller')) {
            update.imageUrl = '/images/ai/roller_shade_white_1777429322768.png';
            if (product.title.toLowerCase().includes('blackout')) {
                 update.imageUrl = '/images/ai/roller_shade_black_1777429348345.png';
            }
        } else if (product.category === 'Zebra Shades' || product.title.toLowerCase().includes('zebra')) {
            update.imageUrl = '/images/ai/zebra_shade_white_1777429360324.png';
        }

        if (Object.keys(update).length > 0) {
            await updateDoc(doc(db, "products", d.id), update);
            console.log(`✅ Updated visuals for: ${product.title}`);
        }
    }

    // 3. Add Nex-Doors and Pergola
    const newProducts = [
        {
            id: 'nex-doors-bifold-001',
            title: 'Nex-Doors™ Premium Bi-Fold Glass Doors',
            category: 'Glass Doors',
            basePrice: 2450.00,
            imageUrl: '/images/ai/glass_doors_premium_1777429374604.png',
            description: 'Ultra-premium bi-fold glass doors with slim aluminum frames. Seamlessly connects your indoor and outdoor living spaces. High-performance thermal glass with customizable finishes.',
            features: ['Slim aluminum profiles', 'Thermal insulation', 'Smooth gliding mechanism', 'Multi-point locking system'],
            inStock: true,
            featured: true
        },
        {
            id: 'pergola-motorized-001',
            title: 'ZSHINE™ Motorized Luxury Pergola',
            category: 'Outdoor Tech',
            basePrice: 3800.00,
            imageUrl: '/images/ai/pergola_outdoor_tech_1777429388159.png',
            description: 'State-of-the-art motorized pergola with adjustable louvers, integrated LED lighting, and optional side screens. Control your outdoor environment with the ZSHINE app.',
            features: ['Motorized louvers', 'Integrated LED', 'Wind sensor auto-close', 'Weatherproof construction'],
            inStock: true,
            featured: true
        }
    ];

    for (const p of newProducts) {
        const { id, ...data } = p;
        await setDoc(doc(db, "products", id), data);
        console.log(`✨ Added new product: ${data.title}`);
    }

    console.log("Final sync complete!");
    process.exit(0);
}

finalCleanup();
