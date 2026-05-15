
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const smartTechProducts = [
    {
        title: "ZSHINE™ Motorized System",
        name: "ZSHINE™ Motor",
        category: "motor",
        price: 199,
        description: "High-torque, ultra-quiet motorized system for Roller and Zebra shades. Precision control with soft start/stop technology.",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
        specs: {
            power: "12V DC / AC options",
            noise: "<35dB",
            torque: "1.1Nm - 2.0Nm"
        }
    },
    {
        title: "ZSHINE™ Multi-Channel Remote",
        name: "Precision Remote",
        category: "motor",
        price: 45,
        description: "433.92 MHz Fixed Code Remote. Available in 1, 5, and 15 channel configurations for total home control.",
        image: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=800&q=80",
        instructions: `【Attention】
These Remote controls are fixed code, and only compatible with some mainstream fixed code electric curtain motors.
Compatible with 433.92 MHz mainstream fixed code motors.
Not compatible with rolling code motors.
Batteries not included due to shipping restrictions.

【Pairing - Curtain Motor】
1. Power on motor & set to pairing mode.
2. Press SET button on back of remote.
3. Select channel & press P2 button on back.

【Pairing - Tubular Motor】
1. Power on motor. Within 15s:
2. Press P2 twice (motor will shake/sound).
3. Press UP button once to complete.

【Packing List】
Remote control*1, Bracket*1, User manual*1 (Battery not included).`,
        specs: {
            frequency: "433.92 MHz",
            type: "Fixed Code",
            channels: "1 / 5 / 15"
        }
    },
    {
        title: "ZSHINE™ Solar Charging Panel",
        name: "Solar Panel",
        category: "motor",
        price: 79,
        description: "Eco-friendly solar power solution. Keeps your motorized shades charged year-round using sustainable energy.",
        image: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&w=800&q=80",
        specs: {
            output: "12V",
            mounting: "Window Glass / Frame",
            efficiency: "High-efficiency Monocrystalline"
        }
    },
    {
        title: "ZSHINE™ Smart Bridge Hub",
        name: "Smart Hub",
        category: "motor",
        price: 129,
        description: "Connect your shades to the world. Integrates seamlessly with Alexa, Google Home, and smartphone apps for remote access.",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
        specs: {
            connectivity: "Wi-Fi 2.4GHz / Zigbee",
            voiceControl: "Alexa, Google, Siri",
            range: "Up to 30m"
        }
    }
];

async function registerSmartTech() {
    console.log("Registering Smart Tech Products...");
    for (const p of smartTechProducts) {
        try {
            await addDoc(collection(db, "products"), {
                ...p,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isHidden: false
            });
            console.log(`Registered: ${p.name}`);
        } catch (e) {
            console.error(`Error registering ${p.name}:`, e);
        }
    }
}

registerSmartTech().catch(console.error);
