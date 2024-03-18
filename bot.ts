import TelegramBot from 'node-telegram-bot-api';
import { db } from './firebaseModule';
import dotenv from 'dotenv';
dotenv.config();

import { findObject } from './firebaseSearchModule';
import { formatDataForDisplay } from './dataFormatting';

import * as registrationModule from './start';
import * as paymentsModule from './payment';



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

bot.onText(/\/check/, async (msg: any) => {
    const inputArray = msg.text ? msg.text.split(' ') : [];

    if (inputArray.length === 1) {
        // Обработка случая без аргументов
    } else {
        const [command, ...nameArray] = inputArray;
        const name = nameArray.join(' ');

        findObject(name, 'child').then((result) => {
            if (result.child_id) {
                // Найден child_id 
                // Теперь необходимо получить данные о ребенке, родителе и платеже
                const childRef = db.ref(`children/${result.child_id}`);
                childRef.once('value', (childSnapshot) => {
                    const childData = childSnapshot.val();

                    const parentRef = db.ref(`parents/${childData.parent_id}`);
                    parentRef.once('value', (parentSnapshot) => {
                        const parentData = parentSnapshot.val();

                        // Получаем данные о платеже из таблицы collections по id платежа из childData
                        const paymentRef = db.ref(`collections/${childData.payment_id}`);
                        paymentRef.once('value', (paymentSnapshot) => {
                            const paymentData = paymentSnapshot.val();
                            const fullData = {
                                child: childData,
                                parent: parentData,
                                payments: paymentData
                            };

                            const formattedData = formatDataForDisplay(fullData);
                            console.log('Полные данные:', formattedData);
                            bot.sendMessage(msg.chat.id, formattedData);
                        });
                    });
                });
            } else {
                console.log('Ребенок не найден');
                bot.sendMessage(msg.chat.id, 'Ребенок не найден');
            }
        }).catch((error) => {
            console.error(error);
            bot.sendMessage(msg.chat.id, `Error: ${error}`);
        });
    }
});
