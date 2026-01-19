import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// export const analytics = getAnalytics(app);

export default app;
