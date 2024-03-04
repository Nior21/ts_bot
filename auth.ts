import admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bot-2022042-default-rtdb.firebaseio.com'
});

const db = admin.database();

function checkBotRegistration(botToken: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const botsRef = db.ref('registeredBots');

        botsRef.once('value', (snapshot) => {
            resolve(snapshot.exists() && snapshot.child(botToken).exists());
        });
    });
}

export { checkBotRegistration };

