import TelegramBot from 'node-telegram-bot-api';
import { db } from './firebaseModule';
import dotenv from 'dotenv';
dotenv.config();

import { findObject } from './firebaseSearchModule';
import { formatDataForDisplay, ParentData, PaymentData, FullData, ChildData, CollectionData, escapeMarkdownV2 } from './dataFormatting';

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
                // Получаем данные о ребенке
                const childRef = db.ref(`children/${result.child_id}`);
                childRef.once('value', (childSnapshot) => {
                    const childData = childSnapshot.val();

                    const parentPromises: Promise<ParentData>[] = Object.keys(childData.parents).map((parentId: string) => {
                        return new Promise<ParentData>((resolve, reject) => {
                            const parentRef = db.ref(`parents/${parentId}`);
                            parentRef.once('value', (parentSnapshot) => {
                                resolve(parentSnapshot.val());
                            });
                        });
                    });

                    Promise.all(parentPromises).then((parentsData) => {
                        const paymentPromises: Promise<PaymentData>[] = Object.keys(childData.payments).map((paymentId: string) => {
                            return new Promise<PaymentData>((resolve, reject) => {
                                const paymentRef = db.ref(`children/${result.child_id}/payments/${paymentId}`);
                                paymentRef.once('value', (paymentSnapshot) => {
                                    const paymentData = paymentSnapshot.val();
                                    const collectionRef = db.ref(`collections/${paymentData.collection_id}`);
                                    collectionRef.once('value', (collectionSnapshot) => {
                                        const collectionData = collectionSnapshot.val();

                                        const payment: PaymentData = {
                                            collection_id: paymentData.collection_id,
                                            name: paymentData.collection_name,
                                            bank_account_or_card_number: paymentData.bank_account_or_card_number,
                                            collection_amount: paymentData.collection_amount,
                                            payment_date: paymentData.payment_date,
                                            received_bank: paymentData.received_bank,
                                            comments: paymentData.comments,
                                            collection: collectionData // Связываем данные платежей с данными коллекций
                                        };
                                        resolve(payment);
                                    });
                                });
                            });
                        });

                        Promise.all(paymentPromises).then((paymentsData) => {
                            const fullData: FullData = {
                                child: childData,
                                parents: parentsData,
                                payments: paymentsData
                            };

                            const formattedData = escapeMarkdownV2(formatDataForDisplay(fullData), false);
                            console.log('Полные данные:', formattedData);
                            bot.sendMessage(msg.chat.id, formattedData, { parse_mode: 'MarkdownV2' });
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
