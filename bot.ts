//bot.ts
// Библиотеки
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
// Модули
import { checkUser } from './modules/checkUserModule';
import { createInlineSearch } from './modules/inlineModule';
// Окружение
const token = process.env.TELEGRAM_BOT_TOKEN!;

export const bot = new TelegramBot(token, { polling: true });
// Код бота
bot.on('text', async (msg: any) => {
    const [, command, rest] = msg.text.match(/(\/\S+\s*|)([\s\S]*)/);

    switch (command) {
        case '/start':
            checkUser(msg).then(() => {
                createInlineSearch(msg);
            });
            break;
    }
});
