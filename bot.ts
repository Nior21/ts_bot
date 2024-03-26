//bot.ts
// Библиотеки
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
// Модули
import { mono } from './modules/formatModule';
import { checkUser } from './modules/checkUserModule';
import { inlineSearch } from './modules/inlineModule';
import { answer } from './modules/answerModule';
// Окружение
const token = process.env.TELEGRAM_BOT_TOKEN!;
// Стартовые переменные
const question1 = `Теперь привяжите ребенка к вашей учетной записи.
Пример:
${mono('@iXNF0i5sZJzCoJ0W_bot Вася')}
Кнопка ниже подставит имя бота и начнет поиск...`
const question2 = `Теперь привяжите родителя к вашей учетной записи.
Пример: ${mono('@iXNF0i5sZJzCoJ0W_bot Николай')}
Кнопка ниже подставит имя бота и начнет поиск...`

export const bot = new TelegramBot(token, { polling: true });
// Код бота
bot.on("polling_error", (msg) => console.log(msg));

bot.on('text', async (msg: any) => {
    const [, command, rest] = msg.text.match(/(\/\S+\s*|)([\s\S]*)/);

    switch (command) {
        case '/start':
            checkUser(msg).then(() => {
                inlineSearch(msg, question1, 'children').then(() => {
                    inlineSearch(msg, question2, 'parents')
                })
            });
            break;
    }
});

/**
 * Запускаем бота и регистрируемся
 * - ищем ребенка
 * - выбираем родителя
 * Получаем списком всю информацию
 * Получаем уведомление о невыплаченных транзакциях с возможностью оставить комментарий
 * - Ссылки на оплату и данные
 * Команда /check для проверки всех данных
 * - Ссылки на оплату и тут
 * Данные о начале регистрации
 * Блокировка отдельных оплат, с целью убрать уведомления
 */

