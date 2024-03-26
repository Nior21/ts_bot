//bot.ts
// Библиотеки
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
// Модули
import { escapeMarkdownV2, mono } from './modules/formatModule';
import { answer } from './modules/answerModule';
import { checkUser } from './modules/checkUserModule';
import { inlineSearch } from './modules/inlineModule';
// Окружение
const token = process.env.TELEGRAM_BOT_TOKEN!;
const isInline = false;

export const bot = new TelegramBot(token, { polling: true });
// Код бота
bot.on('text', async (msg: any) => {
    const [, command, rest] = msg.text.match(/(\/\S+\s*|)([\s\S]*)/);

    switch (command) {
        case '/start':
            checkUser(msg).then(() => {
                const search = inlineSearch(msg, 'children').then(({ option, handler }) => {
                    // Отправляем сообщение с кнопкой "Поиск в записях"
                    answer(msg.chat.id, escapeMarkdownV2(`Теперь привяжите ребенка к вашей учетной записи.
Формат: ${mono('@some_name_bot <child_name>')}
Пример: ${mono('@iXNF0i5sZJzCoJ0W_bot Вася')}
Кнопка ниже подставит имя бота и начнет поиск...`, false), option);
                    handler(msg)
                })



            }).then(() => {
                // Отправляем сообщение с кнопкой "Поиск в записях"
                answer(msg.chat.id, escapeMarkdownV2(`Теперь привяжите родителя к вашей учетной записи.
Формат: ${mono('@some_name_bot <child_name>')}
Пример: ${mono('@iXNF0i5sZJzCoJ0W_bot Николай')}
Кнопка ниже подставит имя бота и начнет поиск...`, false), inlineSearch(msg, 'parents'));

            });
            break;
    }
});

// // Обработка инлайн-запросов (дефолтная)
// if (!isInline) {
//     bot.on('inline_query', async (query) => {
//         const inlineQueryResults: TelegramBot.InlineQueryResultArticle[] = [{
//             type: 'article',
//             id: '1',
//             title: `Только для пользователей бота`,
//             input_message_content: {
//                 message_text: escapeMarkdownV2(`Поиск недоступен вне контекста`)
//             }
//         }]
//         bot.answerInlineQuery(query.id, inlineQueryResults);
//     });
// }

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