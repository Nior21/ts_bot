import TelegramBot, { ChosenInlineResult, InlineQuery } from 'node-telegram-bot-api';
import { bot } from '../bot';
import { Data } from './databaseModule';
import { answer } from './answerModule';
import { escapeMarkdownV2 } from './formatModule';

let chosenItem = '';
let queryListener: any;

const handlerChosenInlineResult = (resolve: any): (chosenResult: ChosenInlineResult) => void => {
    return (chosenResult: ChosenInlineResult) => {
        chosenItem = chosenResult.result_id;
        resolve(chosenItem);
    };
};

async function handleInlineQuery(resolve: any, reject: any, dataType: string): Promise<(query: InlineQuery) => Promise<void>> {
    return async (query: InlineQuery): Promise<void> => {
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
        } finally {

            bot.removeListener('chosen_inline_result', handlerChosenInlineResult(resolve));
            // Дополнительно можно здесь очистить данные поиска или сделать другие необходимые действия
            queryListener.removeListener();
            resolve('someResult'); // Завершаем функцию поиска с результатом
        }
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

    return new Promise<string>(async (resolve, reject) => {
        const queryHandler = await handleInlineQuery(resolve, reject, dataType);

        bot.on('inline_query', queryHandler);

        bot.on('chosen_inline_result', handlerChosenInlineResult(resolve));

        answer(msg.chat.id, question, false, option);

        queryListener = bot.on('inline_query', queryHandler);
    });
}
