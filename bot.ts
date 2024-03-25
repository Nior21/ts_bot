//bot.ts
// Библиотеки
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
// Модули
import { Data } from './modules/databaseModule';
import { checkUser } from './modules/checkUserModule';
import { answer } from './modules/answerModule';
// Окружение
const token = process.env.TELEGRAM_BOT_TOKEN!;
export const bot = new TelegramBot(token, { polling: true });
// Код бота
bot.on('text', async (msg: any) => {
    const isCommand = msg.text.match(/\/\S+/g) !== null;
    const inputArray = msg.text ? msg.text.split(' ') : [];
    const [command, ...rest] = inputArray;

    switch (command) {
        case '/start':
            handleAutoCompleteSearch(msg);
            break;
    }
});
// Функция для обработки "автозаполнения" в чате с кнопкой для инлайн-поиска
export async function handleAutoCompleteSearch(msg: any) {
    const chatId = msg.chat.id;

    // Создаем карточку пользователя в базе данных
    checkUser(msg).then(() => {
        // Показываем кнопку для поиска в записях
        const messageOptions = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Начать поиск ребенка по имени...',
                            switch_inline_query_current_chat: ''
                        }
                    ]
                ]
            }
        };

        // Отправляем сообщение с кнопкой "Поиск в записях"
        answer(chatId, 'Давайте привяжем ребенка к вашей учетной записи:', messageOptions);
        // Вызываем функцию для обработки инлайн-запросов
        findAndLinkChild(msg);
    });
}

// Функция для обработки инлайн-запросов и возврата результатов поиска
export function findAndLinkChild(msg: any) {
    bot.on('inline_query', async (query) => {
        const searchString = query.query;
        const childrenData = await new Data('children').findObject('name', searchString);

        if (childrenData.object_id) {
            const inlineQueryResults: TelegramBot.InlineQueryResultArticle[] = [{
                type: 'article',
                id: childrenData.object_id,
                title: `Обнаружены следующие записи: ${searchString}`,
                input_message_content: {
                    message_text: `Выбран ребенок: ${childrenData.object_id}`
                }
            }];
            bot.answerInlineQuery(query.id, inlineQueryResults);
        } else {
            bot.answerInlineQuery(query.id, []);
        }
    });
}
