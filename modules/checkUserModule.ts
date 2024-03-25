import { Data } from './databaseModule';
import { answer } from './answerModule';
import { mono, escapeMarkdownV2 } from './formatModule';

export const checkUser = async (msg: any) => {
    const currentUser = new Data(`users/${msg.chat.id}`);
    try {
        let dataExists = await currentUser.get();

        if (!dataExists) {
            await currentUser.set({
                registered_on: new Date().toISOString(),
                stage: 'idle'
            });
            answer(msg.chat.id, escapeMarkdownV2(`Добрый день. Данный бот призван помочь род.комитету группы эффективно производить голосования и сбор средств`));
            return answer(msg.chat.id, `Создан новый пользователь с ID: ${mono(String(msg.chat.id))}`);
        } else {
            return answer(msg.chat.id, `Ваш аккаунт уже инициализирован с ID: ${mono(String(msg.chat.id))}`);
        }
    } catch (error) {
        return answer(msg.chat.id, 'Error handling the message:', error);
    }
}