//inlineModule.ts
/** Библиотеки */
import TelegramBot, { ChosenInlineResult } from 'node-telegram-bot-api';
/** Модули */
import { bot } from '../bot'
import { Data } from './databaseModule';
import { answer } from './answerModule';
import { escapeMarkdownV2 } from './formatModule';
/** Переменные */
let chosenItem = '';
/** Код модуля */
function handlerChosenInlineResult(resolve: any): (result: ChosenInlineResult) => void {
    return (chosenResult: ChosenInlineResult) => {
        chosenItem = chosenResult.result_id;
        bot.removeListener('chosen_inline_result', handlerChosenInlineResult); // Уберите resolve из обработчика события
        resolve(chosenItem);
    };
}

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
        bot.on('chosen_inline_result', handlerChosenInlineResult(resolve));

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
                    }));
                    bot.answerInlineQuery(query.id, inlineQueryResults);
                } else {
                    const inlineQueryResults: TelegramBot.InlineQueryResultArticle[] =
                        [{
                            type: 'article',
                            id: '0',
                            title: `Объекты недоступны`,
                            input_message_content: {
                                message_text: `Поиск в базе не удался`
                            }
                        }];
                    bot.answerInlineQuery(query.id, inlineQueryResults);
                }
            } catch (error) {
                reject(error);
            }
        });
        answer(msg.chat.id, question, false, option);
    });
}