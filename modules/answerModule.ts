//answerModule.ts
import { bot } from './../bot';
import { escapeMarkdownV2 } from './formatModule';

export const answer = (chatId: string, text: string, escape?: boolean, options?: any) => {
    text = escapeMarkdownV2(text, escape);
    console.log(text);

    // Объединяем переданные опции с опцией parse_mode: 'MarkdownV2'
    const finalOptions = options ? { ...options, parse_mode: 'MarkdownV2' } : { parse_mode: 'MarkdownV2' };

    bot.sendMessage(chatId, text, finalOptions);
    return text;
}
