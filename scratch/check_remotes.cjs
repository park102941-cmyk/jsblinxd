
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkRemotes() {
    console.log('Checking Remote products...');
    const snapshot = await db.collection('products').get();
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title && data.title.toLowerCase().includes('remote')) {
            console.log(`- ID: ${doc.id}, Title: ${data.title}, Category: ${data.category}`);
        }
    });
}

checkRemotes();
