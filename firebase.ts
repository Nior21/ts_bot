import admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bot-2022042-default-rtdb.firebaseio.com'
});

const db = firebaseApp.database();

export { db };


