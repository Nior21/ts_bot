/// <reference path="./database.ts"/>

import TelegramBot from 'node-telegram-bot-api';
import { db } from './firebaseModule';
import dotenv from 'dotenv';
dotenv.config();

import * as registrationModule from './startModule';
import * as checkModule from './checkModule';
const token = process.env.TELEGRAM_BOT_TOKEN!;
const admin_id = process.env.YOUR_BOT_CREATOR_CHAT_ID!;

export const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));

bot.on('text', async (msg: any) => {
    const inputArray = msg.text ? msg.text.split(' ') : [];
    const isCommand = msg.text.match(/\/\S+/g) !== null; // Проверяем команда это или просто текст
    const [command, ...nameArray] = inputArray;

    // Узнаем о пользователе что можем или создаем нового
    const userRef = db.ref(`users/${msg.chat.id}`);
    let userData: any;
    userRef.once('value', async (snapshot) => {
        userData = snapshot.val();
        if (!userData) { // Если пользователя нет в базе users, создаем новую запись
            userRef.set({
                registered_on: new Date().toISOString(),
                stage: 'idle'
            });
            bot.sendMessage(msg.chat.id, 'Текущий пользователь не обнаружен в БД, создаем новую карточку...');
            // Переход к регистрации произойдет в блоке проверки команд и статусов
        }
        console.log(userData);
    });

    if (isCommand) { // Обрабатываем команды и статусы. Сначала команду, потом размер
        switch (command) {
            case '/start':
                registrationModule.registration(msg);
                break;
            case '/check': // Пытаемся получить информацию по ребенку
                if (!userData.child) { // Сначала надо убедиться что ребенок не указан, прежде чем спросить про ребенка
                    if (inputArray.length === 1) {
                        bot.sendMessage(msg.chat.id, `Укажите имя ребенка для поиска данных...`); // Затем запрашиваем имя ребенка у пользователя
                        userRef.update({ stage: 'waiting_child_name' }); // Обновляем статус пользователю на ожидание имени ребенка
                    } else { // Если ребенок указан в запросе
                        const name = nameArray.join(' ');
                        checkModule.check(name, msg);
                    }
                }
                break;
            default:
                console.error(`Получена неизвестная команда`);
                bot.sendMessage(msg.chat.id, `Получена неизвестная команда`);
                break;
        }
    } else { // Если не команда, то проверяем stage
        const stagesRef = db.ref(`users/${msg.chat.id}/stage`);
        stagesRef.once('value', async (snapshot) => {
            const stageData = snapshot.val();
            if (stageData) {
                switch (stageData) {
                    case 'idle': // Режим ожидания, можно общаться с администратором бота
                        bot.sendMessage(admin_id, `Сообщение от "Инкогнито \[${msg.chat.id}\]\/ИмяВзятьИзБазы": \_${msg.text}\_`);
                        //bot.sendMessage(msg.chat.id, `Ваше сообщение успешно доставлено администратору: ${msg.text}`);
                        break;
                    case 'waiting_child_name':
                        registrationModule.registration(msg);
                        break;
                    default:
                        console.log('Актуальный статус не обнаружен, возможно пользователь не зарегистрирован.')
                        bot.sendMessage(msg.chat.id, `Актуальный статус не обнаружен, возможно пользователь \[${msg.chat.id}\] не зарегистрирован.`);
                }
            } else { // Если данные пользователя не были найдены, уходим к созданию пользователей
                bot.sendMessage(msg.chat.id, `Пользователь с вашим ID \[${msg.chat.id}\] не обнаружен. Переключаем бота на регистрацию...`);
                registrationModule.registration(msg);
            }
        })
    }
});
