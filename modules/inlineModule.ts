//inlineModule.ts
/** Библиотеки */
import TelegramBot from 'node-telegram-bot-api';
/** Модули */
import { bot } from '../bot'
import { Data } from './databaseModule';
import { answer } from './answerModule';
import { escapeMarkdownV2, mono } from './formatModule';

export async function inlineSearch(msg: any, question: string, dataType: string): Promise<void> {
    // TODO: проверять авторизацию (права) пользователей в базе
    const option = {  // Возвращаем кнопку для поиска в записях
        reply_markup: {
            inline_keyboard: [[{
                text: `Начать поиск (${dataType})...`,
                switch_inline_query_current_chat: ''
            }]]
        }
    };
    return new Promise((resolve, reject) => {
        // Отправляем сообщение с кнопкой "Поиск в записях"
        answer(msg.chat.id, escapeMarkdownV2(`Теперь привяжите ребенка к вашей учетной записи.
            Пример поисковой строки:
            ${mono('@iXNF0i5sZJzCoJ0W_bot Вася')}
            Кнопка ниже подставит имя бота и начнет поиск...`, false), option);

        bot.on('inline_query', async (query) => { // Обработка инлайн-запросов
            const searchName = query.query;
            const data = await new Data(dataType).findObject('name', searchName);

            if (data.result) {
                const inlineQueryResults: TelegramBot.InlineQueryResultArticle[] = data.result.map((onesElement: any) => ({
                    type: 'article',
                    id: onesElement.item.id,
                    title: `${onesElement.item.name}`,
                    input_message_content: {
                        message_text: escapeMarkdownV2(`Из списка выбран(-а): ${onesElement.item.name}`)
                    }
                }));
                bot.answerInlineQuery(query.id, inlineQueryResults)
                    .then(() => {
                        // Поиск завершен, можно выполнить следующую функцию или что-то еще
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else {
                bot.answerInlineQuery(query.id, [])
                    .then(() => {
                        // Поиск завершен, можно выполнить следующую функцию или что-то еще
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    });
}