//answerModule.ts
import { bot } from './../bot';

export const answer = (chatId: string, text: string, options?: any) => {
    console.log(text);

    // Объединяем переданные опции с опцией parse_mode: 'MarkdownV2'
    const finalOptions = options ? { ...options, parse_mode: 'MarkdownV2' } : { parse_mode: 'MarkdownV2' };

    bot.sendMessage(chatId, text, finalOptions);
    return text;
}
