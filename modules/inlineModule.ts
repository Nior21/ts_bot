//inlineModule.ts
/** Библиотеки */
import TelegramBot from 'node-telegram-bot-api';
/** Модули */
import { bot } from '../bot'
import { Data } from './databaseModule';
import { answer } from './answerModule';

export async function inlineSearch(msg: any, question: string, dataType: string): Promise<void> {
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

    return new Promise((resolve, reject) => {
        // Отправляем сообщение с кнопкой "Поиск в записях"
        answer(msg.chat.id, question, false, option);

        bot.on('inline_query', async (query) => {
            const searchName = query.query;
            let data: any;

            try {
                data = await new Data(dataType).findObject('name', searchName);
            } catch (error) {
                reject(error);
            }

            if (data.result) { // Успех
                const result = data.result;
                resolve();
            } else { // Отказ
                bot.answerInlineQuery(query.id, []);
                reject(`Объекты не найдены ${dataType}.`);
            }
        });
    });
}
