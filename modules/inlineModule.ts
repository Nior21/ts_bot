//inlineModule.ts
/** Библиотеки */
import TelegramBot from 'node-telegram-bot-api';
/** Модули */
import { bot } from '../bot'
import { Data } from './databaseModule';
import { answer } from './answerModule';
import { escapeMarkdownV2 } from './formatModule';
/** Переменные */
let chosenItem: string = '';

export async function inlineSearch(msg: any, question: string, dataType: string): Promise<string> {
    const option = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: `Начать поиск (${dataType})...`,
                        switch_inline_query_current_chat: ''
                    }
                ]
            ]
        }
    };

    return new Promise<string>((resolve, reject) => {
        // Отправляем сообщение с кнопкой "Поиск в записях"
        answer(msg.chat.id, question, false, option);

        bot.on('chosen_inline_result', (chosenResult) => {
            chosenItem = chosenResult.result_id;
            resolve(chosenItem); // Резолвим промис после выбора пользователя
        });

        bot.on('inline_query', async (query) => {
            const searchName = query.query;
            let data: any;

            try {
                data = await new Data(dataType).findObject('name', searchName, 3);
                if (data.result) {
                    const inlineQueryResults: TelegramBot.InlineQueryResultArticle[] = data.result.map((onesElement: any) => ({
                        type: 'article',
                        id: onesElement.item.id,
                        title: `${onesElement.item.name}`,
                        input_message_content: {
                            message_text: escapeMarkdownV2(`Из списка выбран(-а): ${onesElement.item.name}`)
                        }
                    }))
                    bot.answerInlineQuery(query.id, inlineQueryResults);
                } else {
                    bot.answerInlineQuery(query.id, []);
                }
            } catch (error) {
                reject(error);
            }

            if (data.result) {
                // Успешный поиск, результат возвращается пользователю
                const result = data.result;
            } else {
                bot.answerInlineQuery(query.id, []);
                reject(`Объекты не найдены (${dataType}).`);
            }
        });
    });
}