//inlineModule.ts
import { Data } from './databaseModule';
import { escapeMarkdownV2, mono } from './formatModule';
import { bot } from './../bot'
import TelegramBot from 'node-telegram-bot-api';

export async function inlineSearch(msg: any, dataType: string) {
    // TODO: проверять авторизацию (права) пользователей в базе

    return {
        option: { // Возвращаем кнопку для поиска в записях
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
        },
        handler: (query: any) => {
            bot.on('inline_query', async (query) => { // Обработка инлайн-запросов
                const searchName = query.query;
                const data = await new Data(dataType).findObject('name', searchName);

                if (data.result) {
                    const inlineQueryResults: TelegramBot.InlineQueryResultArticle[] = data
                        .result
                        .map((onesElement: any) => ({
                            type: 'article',
                            id: onesElement.item.id,
                            title: `${onesElement.item.name}`,
                            input_message_content: {
                                message_text: escapeMarkdownV2(`Из списка выбран(-а): ${onesElement.item.name}`)
                            }
                        }));
                    bot.answerInlineQuery(query.id, inlineQueryResults);
                } else {
                    bot.answerInlineQuery(query.id, []);
                }
            })
        }
    }
}