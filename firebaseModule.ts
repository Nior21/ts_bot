import * as adminSDK from 'firebase-admin';
const serviceAccount = require('./serviceAccountKey.json');

// Инициализация приложения Firebase
adminSDK.initializeApp({
    credential: adminSDK.credential.cert(serviceAccount as adminSDK.ServiceAccount),
    databaseURL: 'https://bot-2022042-default-rtdb.firebaseio.com'
});

// Создание ссылки на базу данных
const db = adminSDK.database();

// // Функция для проверки прав доступа
// async function checkAccess(chatId: string, childId: string) {
//     try {
//         const snapshot = await db.ref(`/users/${chatId}/child_id`).once('value');
//         const userChildId = snapshot.val();
//         return userChildId === childId;
//     } catch (error) {
//         console.error('Error checking access:', error);
//         return false;
//     }
// }

// // Пример использования функции checkAccess
// const chatId = '233097427';
// const childId = "-Nsr15AEy9FmuD70O6E3";
// checkAccess(chatId, childId)
//     .then(hasAccess => {
//         if (hasAccess) {
//             console.log('User has access to child data');
//         } else {
//             console.log('User does not have access to child data');
//         }
//     });


export { db };