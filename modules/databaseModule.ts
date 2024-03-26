//databaseModule.tss
import * as adminSDK from 'firebase-admin';
import Fuse from 'fuse.js';
import dotenv from 'dotenv';
dotenv.config();

const databaseURL = process.env.DATABASE_URL!;

// Инициализация Firebase Admin SDK с использованием сервисного аккаунта
import * as serviceAccount from '../serviceAccountKey.json';

// Инициализация приложения Firebase
adminSDK.initializeApp({
    credential: adminSDK.credential.cert(serviceAccount as adminSDK.ServiceAccount),
    databaseURL: databaseURL
});


// Создание ссылки на базу данных
const db = adminSDK.database();

export interface Document {
    id: string;
    name: string;
}

export interface ReturnValue {
    result: any;
    object_id: string | null;
    ref: any;
}

export class Data {
    data: any;
    constructor(protected name: string) { }

    async get(): Promise<any> {
        try {
            const ref = db.ref(this.name);
            const snapshot = await ref.once('value');
            this.data = snapshot.val();
            return this.data;
        } catch (error) {
            console.log('Error getting data:', error);
        }
    }

    async set(data: any): Promise<any> {
        try {
            const ref = db.ref(this.name);
            await ref.update(data);
            const snapshot = await ref.once('value');
            this.data = snapshot.val();
            return this.data;
        } catch (error) {
            console.log('Error setting data:', error);
        }
    }

    async findObject(property: string, value: any, maxResults: number = -1): Promise<ReturnValue> {
        const ref = db.ref(this.name);
        const data: Document[] = [];

        const snapshot = await ref.once('value');
        const firebaseData = snapshot.val();

        if (firebaseData) {
            Object.entries(firebaseData).forEach(([key, obj]: [string, any]) => {
                data.push({
                    id: key,
                    name: obj.name
                });
            });
        }

        const options = {
            keys: ['name'],
            includeMatches: true
        };
        const fuse = new Fuse(data, options);
        let results = fuse.search(value);

        if (maxResults !== -1) {
            results = results.slice(0, maxResults);
        }

        if (results.length > 0 && results[0].item.name === value) {
            return {
                result: results,
                object_id: results[0].item.id,
                ref: ref
            };
        } else {
            return {
                result: results,
                object_id: null,
                ref: ref
            };
        }
    }
}