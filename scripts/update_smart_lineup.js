
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";

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

const newSmartProducts = [
    {
        title: "ZSHINE™ 1-Channel Remote Control",
        name: "1-Channel Remote",
        category: "motor",
        price: 35,
        description: "Precision control for a single motorized shade. 433.92 MHz Fixed Code.",
        image: "/src/assets/products/remotes/remote_3.png",
        instructions: `【Attention】
- Fixed code (433.92 MHz) only.
- Not compatible with rolling code motors.
- Battery not included (Purchase locally).`,
        specs: { frequency: "433.92 MHz", type: "Fixed Code", channels: "1" }
    },
    {
        title: "ZSHINE™ 4-Channel Remote Control",
        name: "4-Channel Remote",
        category: "motor",
        price: 45,
        description: "Control up to 4 motorized shades individually or as a group. Sleek white design.",
        image: "/src/assets/products/remotes/remote_2.png",
        instructions: `【Attention】
- Fixed code (433.92 MHz) only.
- Not compatible with rolling code motors.
- Battery not included.`,
        specs: { frequency: "433.92 MHz", type: "Fixed Code", channels: "4" }
    },
    {
        title: "ZSHINE™ 15-Channel Remote Control",
        name: "15-Channel Remote",
        category: "motor",
        price: 65,
        description: "Advanced LCD remote for total home control. Manage up to 15 different zones.",
        image: "/src/assets/products/remotes/remote_4.png",
        instructions: `【Attention】
- Fixed code (433.92 MHz) only.
- Not compatible with rolling code motors.
- Battery not included.`,
        specs: { frequency: "433.92 MHz", type: "Fixed Code", channels: "15" }
    },
    {
        title: "ZSHINE™ Smart Bridge Hub",
        name: "Smart Hub",
        category: "motor",
        price: 129,
        description: "Wi-Fi to RF Bridge. Connect your motorized shades to Alexa, Google Home, and the smartphone app.",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
        specs: { connectivity: "Wi-Fi / RF 433MHz", compatibility: "Alexa, Google, App" }
    }
];

async function updateSmartProducts() {
    console.log("Cleaning up old smart products...");
    const snapshot = await getDocs(collection(db, "products"));
    for (const d of snapshot.docs) {
        const data = d.data();
        if (data.category === "motor" || (data.title && data.title.includes("ZSHINE™"))) {
            console.log(`Deleting: ${d.id} (${data.title})`);
            await deleteDoc(doc(db, "products", d.id));
        }
    }

    console.log("Registering new Smart Tech lineup...");
    for (const p of newSmartProducts) {
        await addDoc(collection(db, "products"), {
            ...p,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isHidden: false
        });
        console.log(`Registered: ${p.title}`);
    }
    console.log("✅ Done!");
}

updateSmartProducts().catch(console.error);
