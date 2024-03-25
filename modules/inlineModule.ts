import { Data } from './databaseModule';
import { answer } from './answerModule';
import { escapeMarkdownV2, mono } from './formatModule';
import { bot } from './../bot'
import TelegramBot from 'node-telegram-bot-api';

export async function createInlineSearch(msg: any) {
    let dataToSearch = '';
    // Определение, какие данные использовать в зависимости от chat_id
    if (msg.chat.id === 233097427) {
        dataToSearch = 'children'; // например, для определенного chat_id собираем данные о детях
    } else if (msg.chat.id === 6433641372) {
        dataToSearch = 'parents'; // для другого chat_id собираем данные о родителях
    } else {
        dataToSearch = ''; // для остальных chat_id можно использовать другие данные
    }

    // Показываем кнопку для поиска в записях
    const messageOptions = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: `Начать поиск (${dataToSearch})...`,
                        switch_inline_query_current_chat: ''
                    }
                ]
            ]
        }
    };

    // Отправляем сообщение с кнопкой "Поиск в записях"
    answer(msg.chat.id, escapeMarkdownV2(`Теперь привяжите ребенка к вашей учетной записи.
Формат: ${mono('@some_name_bot <child_name>')}
Пример: ${mono('@iXNF0i5sZJzCoJ0W_bot Вася')}
Кнопка ниже подставит имя бота и начнет поиск...`, false), messageOptions);
    // Обработка инлайн-запросов
    bot.on('inline_query', async (query) => {
        const searchName = query.query;
        const childrenData = await new Data('children').findObject('name', searchName);

        if (childrenData.result) {
            const inlineQueryResults: TelegramBot.InlineQueryResultArticle[] = childrenData
                .result
                .map((childData: any) => ({
                    type: 'article',
                    id: childData.item.id,
                    title: `${childData.item.name}`,
                    input_message_content: {
                        message_text: `Вы выбрали ребенка из списка: ${childData.item.name}`
                    }
                }));

            bot.answerInlineQuery(query.id, inlineQueryResults);
        } else {
            bot.answerInlineQuery(query.id, []);
        }
    });
}