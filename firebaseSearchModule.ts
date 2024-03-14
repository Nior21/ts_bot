import { db } from './firebaseModule'; // Импорт модуля для работы с Firebase
import Fuse from 'fuse.js'; // Импорт Fuse

const childrenRef = db.ref('children');
const parentsRef = db.ref('parents');

type ObjectType = 'child' | 'parent';

// Define the Document interface
interface Document {
    id: string;
    name: string;
}

type MyReturnValue = {
    result: any,
    child_id: string | null,
    ref: any
}
// Функция поиска с использованием Fuse
export function findObject(name: string, type: ObjectType):
    Promise<MyReturnValue> {
    const ref = type === 'child' ? childrenRef : parentsRef;
    const data: Document[] = [];

    const indexingPromise = new Promise<void>((resolve) => {
        ref.once('value', (snapshot) => {
            const firebaseData = snapshot.val();
            if (firebaseData) {
                Object.entries(firebaseData).forEach(([key, obj]: [string, any]) => {
                    data.push({
                        id: key,
                        name: obj.name
                    });
                });

                //console.log('Data fetched from Firebase:', data);
            }

            resolve(); // Помечаем, что индексация завершена
        });
    });

    return indexingPromise.then(() => {
        const options = {
            keys: ['name'],
            includeMatches: true
        };
        const fuse = new Fuse(data, options);
        const results = fuse.search(`${name}*`);

        //console.log('Search results:', results);

        if (results.length > 0) {
            return {
                result: results,
                child_id: results[0].item.id,
                ref: ref
            };
        } else {
            return {
                result: results,
                child_id: null,
                ref: ref
            };
        }
    });
}
