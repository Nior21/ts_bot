import { db } from './firebaseModule';
import Fuse from 'fuse.js';

namespace Database {

    interface Document {
        id: string;
        name: string;
    }

    interface ReturnValue {
        result: any;
        object_id: string | null;
        ref: any; // Уточните тип базы данных (Firebase Realtime Database, Firestore и т.д.)
    }

    export class Data {
        data: any;
        constructor(protected name: string) { }

        async get(): Promise<any> {
            const ref = db.ref(this.name);
            const snapshot = await ref.once('value');
            this.data = snapshot.val();
            return this.data;
        }

        async set(data: any): Promise<any> {
            const ref = db.ref(this.name);
            await ref.update(data);
            const snapshot = await ref.once('value');
            this.data = snapshot.val();
            return this.data;
        }

        async findObject(property: string, value: any): Promise<ReturnValue> {
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
            const results = fuse.search(value);

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

    export class Child extends Data {
        constructor(name: string) {
            super(name);
        }
        // Дополнительные методы для работы с детьми, если необходимо
    }

    export class Collect extends Data {
        constructor(name: string) {
            super(name);
        }
        // Дополнительные методы для работы с коллекциями, если необходимо
    }

    export class Parent extends Data {
        constructor(name: string) {
            super(name);
        }
        // Дополнительные методы для работы с родителями, если необходимо
    }

    export class User extends Data {
        constructor(name: string) {
            super(name);
        }
        // Дополнительные методы для работы с пользователями, если необходимо
    }
}
