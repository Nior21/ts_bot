import { Data } from './database';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN!;
//const admin_id = process.env.YOUR_BOT_CREATOR_CHAT_ID!;

export const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));

bot.on('text', async (msg: any) => {
    const isCommand = msg.text.match(/\/\S+/g) !== null; // Проверяем команда это или просто текст
    const inputArray = msg.text ? msg.text.split(' ') : [];
    const [command, ...rest] = inputArray;

    // Узнаем о пользователе что можем или создаем нового
    const currentUser = new Data(`users/${msg.chat.id}`);
    try {
        // Асинхронное чтение данных для проверки наличия
        let dataExists = await currentUser.get();

        // Запись данных, если проверка прошла успешно
        if (!dataExists) {
            await currentUser.set({
                [msg.chat.id]: {
                    registered_on: new Date().toISOString(),
                    stage: 'idle'
                }
            });
            console.log('Создан новый пользователь с ID:', msg.chat.id);
            // Отправить пользователю сообщение об успешной записи данных
            bot.sendMessage(msg.chat.id, `Создан новый пользователь с ID/: ${msg.chat.id}`);
        } else {
            console.log(`Добро пожаловать! Учетная запись с ID: ${msg.chat.id} успешно инициализирована.`);
            // Отправить пользователю сообщение о том, что данные не найдены
            bot.sendMessage(msg.chat.id, `Добро пожаловать! Учетная запись с ID: ${msg.chat.id} успешно инициализирована.`);
        }
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        // Отправить пользователю сообщение об ошибке
        bot.sendMessage(msg.chat.id, 'Произошла ошибка при обработке вашего запроса.');
    }




    //     const userRef = db.ref(`users/${msg.chat.id}`);
    //     let userData: any;
    //     userRef.once('value', async (snapshot) => {
    //         userData = snapshot.val();
    //         if (!userData) { // Если пользователя нет в базе users, создаем новую запись
    //             userRef.set({
    //                 registered_on: new Date().toISOString(),
    //                 stage: 'idle'
    //             });
    //             bot.sendMessage(msg.chat.id, 'Текущий пользователь не обнаружен в БД, создаем новую карточку...');
    //             // Переход к регистрации произойдет в блоке проверки команд и статусов
    //         }
    //         console.log(userData);
    //     });

    //     if (isCommand) { // Обрабатываем команды и статусы. Сначала команду, потом размер
    //         switch (command) {
    //             case '/start':
    //                 registrationModule.registration(msg);
    //                 break;
    //             case '/check': // Пытаемся получить информацию по ребенку
    //                 if (!userData.child) { // Сначала надо убедиться что ребенок не указан, прежде чем спросить про ребенка
    //                     if (inputArray.length === 1) {
    //                         bot.sendMessage(msg.chat.id, `Укажите имя ребенка для поиска данных...`); // Затем запрашиваем имя ребенка у пользователя
    //                         userRef.update({ stage: 'waiting_child_name' }); // Обновляем статус пользователю на ожидание имени ребенка
    //                     } else { // Если ребенок указан в запросе
    //                         const name = rest.join(' ');
    //                         checkModule.check(name, msg);
    //                     }
    //                 }
    //                 break;
    //             case '/get':
    //                 if (inputArray.length === 1) {
    //                     bot.sendMessage(msg.chat.id, `Укажите откуда нужно получить данные`);
    //                     userRef.update({ stage: 'waiting_address' });
    //                 } else {
    //                     new Data(rest[0]).get().then((value: any) => { console.log(value) });
    //                 }
    //                 break;
    //             case '/set':
    //                 if (inputArray.length === 1) {
    //                     bot.sendMessage(msg.chat.id, `Укажите куда нужно добавить данные и что (через пробел)`);
    //                     userRef.update({ stage: 'waiting_address' });
    //                 } else {
    //                     new Data(rest[0]).set(rest[1]).then((value: any) => { console.log(value) });
    //                 }
    //                 break;
    //             default:
    //                 console.error(`Получена неизвестная команда`);
    //                 bot.sendMessage(msg.chat.id, `Получена неизвестная команда`);
    //                 break;
    //         }
    //     } else { // Если не команда, то проверяем stage
    //         const stagesRef = db.ref(`users/${msg.chat.id}/stage`);
    //         stagesRef.once('value', async (snapshot) => {
    //             const stageData = snapshot.val();
    //             if (stageData) {
    //                 switch (stageData) {
    //                     case 'idle': // Режим ожидания, можно общаться с администратором бота
    //                         bot.sendMessage(admin_id, `Сообщение от "Инкогнито \[${msg.chat.id}\]\/ИмяВзятьИзБазы": \_${msg.text}\_`);
    //                         //bot.sendMessage(msg.chat.id, `Ваше сообщение успешно доставлено администратору: ${msg.text}`);
    //                         break;
    //                     case 'waiting_child_name':
    //                         registrationModule.registration(msg);
    //                         break;
    //                     case 'waiting_address':
    //                         new Data(rest[0]).get().then((value: any) => { console.log(value) });
    //                         break;
    //                     default:
    //                         console.log('Актуальный статус не обнаружен, возможно пользователь не зарегистрирован.')
    //                         bot.sendMessage(msg.chat.id, `Актуальный статус не обнаружен, возможно пользователь \[${msg.chat.id}\] не зарегистрирован.`);
    //                 }
    //             } else { // Если данные пользователя не были найдены, уходим к созданию пользователей
    //                 bot.sendMessage(msg.chat.id, `Пользователь с вашим ID \[${msg.chat.id}\] не обнаружен. Переключаем бота на регистрацию...`);
    //                 registrationModule.registration(msg);
    //             }
    //         })
    //     }
});

bot.onTextHandler = async (msg) => {
    const currentUser = new Data(`users/${msg.chat.id}`);
    try {
        let dataExists = await currentUser.get();

        if (!dataExists) {
            await currentUser.set({
                [msg.chat.id]: {
                    registered_on: new Date().toISOString(),
                    stage: 'idle'
                }
            });
            console.log('Создан новый пользователь с ID:', msg.chat.id);
            return `Создан новый пользователь с ID: ${msg.chat.id}`;
        } else {
            console.log(`Добро пожаловать! Учетная запись с ID: ${msg.chat.id} успешно инициализирована.`);
            return `Добро пожаловать! Учетная запись с ID: ${msg.chat.id} успешно инициализирована.`;
        }
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
        return 'Произошла ошибка при обработке вашего запроса.';
    }
};
