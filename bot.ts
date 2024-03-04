import TelegramBot from 'node-telegram-bot-api';
import { db } from './firebase';
import * as process from 'process';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN!;
const admin_id = process.env.YOUR_BOT_CREATOR_CHAT_ID!;

const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));

bot.onText(/\/start/, async (msg: any) => {
    const chatId = msg.chat.id;
    //const registered = await checkBotRegistration(token);
    if (admin_id == chatId) {
        bot.sendMessage(chatId, `Вы зашли в систему с ролью администратора (chatId: ${chatId})`);
    }

    const userRef = db.ref(`users/${chatId}`);

    userRef.once('value', async (snapshot) => {
        if (snapshot.exists()) {
            // Логика, если пользователь уже существует
            bot.sendMessage(chatId, `Запись для пользователя ${chatId} уже существует`);
            const userData = snapshot.val();
            const userInfo: string = `Информация о пользователе ${chatId}:\n` +
                `Родитель: ${userData.phone} ${userData.parentName} (${userData.isMother ? 'мать' : 'отец'})\n` +
                `Ребенок: ${userData.childName} ${userData.childSurname} (ДР: ${userData.birthday})`;

            bot.sendMessage(chatId, userInfo);
        } else {
            // Добавляем нового пользователя, так как пользователя с таким chatId нет в базе
            userRef.set({
                phone: 'empty',
                parentName: 'empty',
                isMother: 'empty',
                childName: 'empty',
                childSurname: 'empty',
                birthday: 'empty',
                stage: 'phone' // Стартуем с этапа ввода телефона
            });
            bot.sendMessage(chatId, 'Введите свой контактный номер телефона:');
        }
    });
});

// Обработчик текстовых сообщений от пользователя
bot.on('text', async (msg: any) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const userRef = db.ref(`users/${chatId}`);

    userRef.once('value', async (snapshot) => {
        const userData = snapshot.val();

        if (userData) {
            switch (userData.stage) {
                case 'phone':
                    userRef.update({ phone: text, stage: 'parentName' });
                    bot.sendMessage(chatId, 'Теперь введите ваше имя:');
                    break;
                case 'parentName':
                    userRef.update({ parentName: text, stage: 'isMother' });
                    bot.sendMessage(chatId, 'Укажите, кем вы приходитесь ребенку (мать/отец/бабушка/дедушка/брат/сестра/тетя/дядя):');
                    break;
                case 'isMother':
                    userRef.update({ isMother: text, stage: 'childName' });
                    bot.sendMessage(chatId, 'Введите имя вашего ребенка:');
                    break;
                case 'childName':
                    userRef.update({ childName: text, stage: 'childSurname' });
                    bot.sendMessage(chatId, 'Введите фамилию вашего ребенка:');
                    break;
                case 'childSurname':
                    userRef.update({ childSurname: text, stage: 'birthday' });
                    bot.sendMessage(chatId, 'Спасибо! Ваши данные успешно добавлены в базу.');
                    break;
                case 'birthday':
                    userRef.update({ birthday: text, stage: 'completed' });
                    bot.sendMessage(chatId, 'Спасибо! Ваши данные успешно добавлены в базу.');
                    break;
                default:
                    bot.sendMessage(chatId, 'Неожиданное сообщение. Пожалуйста, используйте команду /start для начала процесса снова.');
                    break;
            }
        } else {
            // Добавляем нового пользователя, так как данных в базе не существует
            userRef.update({
                phone: text || 'empty', // Если значение text пустое, сохраняем пустую строку
                parentName: 'empty',
                isMother: 'empty',
                childName: 'empty',
                childSurname: 'empty',
                birthday: 'empty',
                stage: 'phone' // Стартуем с этапа ввода телефона
            });

            bot.sendMessage(chatId, 'Введите свой контактный номер телефона:');
        }
    });
});