import TelegramBot from 'node-telegram-bot-api';
import { db } from './firebaseModule';
import dotenv from 'dotenv';
dotenv.config();

import * as registrationModule from './start';
import * as paymentsModule from './payment';
import { findObject } from './firebaseSearchModule'; // Импорт вашего модуля поиска

const token = process.env.TELEGRAM_BOT_TOKEN!;
const admin_id = process.env.YOUR_BOT_CREATOR_CHAT_ID!;

export const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));

// // Реакция на команду /start
// bot.onText(/\/start/, async (msg: any) => {
//     registrationModule.registration(msg);
// });

// // Диалоги, проверка введенного обычного текста
// bot.on('text', async (msg: any) => {
//     const stagesRef = db.ref(`users/${msg.chat.id}/stages`);

//     stagesRef.once('value', async (snapshot) => {
//         const stagesData = snapshot.val();
//         if (stagesData) {
//             console.log('> проверяем базовые статусы в БД (stagesData.current)');
//             switch (stagesData.current) {
//                 case 'idle':
//                     bot.sendMessage(admin_id, `${msg.chat.id} > ${msg.text}`);
//                     bot.sendMessage(msg.chat.id, `Ваше сообщение успешно доставлено администратору: ${msg.text}`);
//                     break;
//                 case 'registration':
//                     if (msg.text !== '/start') {
//                         registrationModule.regDialogs(msg, stagesRef);
//                         break;
//                     }
//                 case 'payment':
//                     if (msg.text !== '/payment') {
//                         // Функция для повторного обращения с указанием имени
//                         console.log('>> запуск ветки payment')
//                         paymentsModule.paymentDialog(msg, stagesRef);
//                         break;
//                     }
//                 default:
//                     console.log('>> статусы не обнаружены')
//             }
//         } else { // Если данные пользователя не были найдены, уходим к созданию пользователей
//             registrationModule.regDialogs(msg, stagesRef);
//         }
//     })
// });

// // Реакция на команду /payment
// bot.onText(/\/payment/, async (msg: any) => {
//     const inputArray = msg.text ? msg.text.split(' ') : [];
//     if (inputArray.length === 1) {
//         // Запускаем функцию для /payment без аргументов
//         console.log('> первый запуск /payment.', typeof inputArray, inputArray)
//         console.log('inputArray.length', typeof inputArray.length, inputArray.length)
//         paymentsModule.paymentWithoutParam(msg);
//     } else if (inputArray.length >= 2) {
//         // Запускаем функцию для /payment c аргументами
//         paymentsModule.paymentWithParam(msg, inputArray);
//     }
// });

// Функция, возвращающая ID объекта или undefined
async function searchChild(name: string) {
    try {
        const childId = await findObject(name, 'child');
        return { found: true, id: childId };
    } catch (error: any) {
        if (error.message.includes("PERMISSION_DENIED")) {
            return { found: false, message: "У вас недостаточно прав для поиска ребенка в базе данных" };
        } else {
            return { found: false, message: "Произошла ошибка при поиске ребенка" };
        }
    }
}


bot.onText(/\/find/, async (msg: any) => {
    const inputArray = msg.text ? msg.text.split(' ') : []; //console.log('inputArray: ', inputArray);

    if (inputArray.length === 1) {
        // Запускаем функцию для /find без аргументов
    } else if (inputArray.length === 2) {
        // Запускаем функцию для /find с аргументами
        const [command, name] = inputArray;
        // Пример вызова функции внутри вашего бота
        searchChild(name).then((result) => {
            if (result.found) {
                console.log(`Ребенок найден с ID: ${result.id}`);
                bot.sendMessage(msg.chat.id, `Ребенок найден с ID: ${result.id}`);
            } else {
                console.log(result.message);
                bot.sendMessage(msg.chat.id, `${result.message}`);
            }
        }).catch((error) => {
            console.error(error);
            bot.sendMessage(msg.chat.id, `Error: ${error}`);
        });
    } else {
        // Обработка остальных случаев (пустой массив, аргументов больше 2)
        const [command, ...nameArray] = inputArray;
        const name = nameArray.join(' ');
        searchChild(name).then((result) => {
            if (result.found) {
                console.log(`Ребенок найден с ID: ${result.id}`);
                bot.sendMessage(msg.chat.id, `Ребенок найден с ID: ${result.id}`);
            } else {
                console.log(result.message);
                bot.sendMessage(msg.chat.id, `${result.message}`);
            }
        }).catch((error) => {
            console.error(error);
            bot.sendMessage(msg.chat.id, `Error: ${error}`);
        });
    }
});