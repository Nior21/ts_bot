import TelegramBot from 'node-telegram-bot-api';
import * as process from 'process';
import dotenv from 'dotenv';
dotenv.config();

import { db } from './firebase';
import { isAdmin, sendAdminMessage, loadUserData, handlePhoneInput, handleParentNameInput, handleIsMotherInput, handleCheckChildren } from './reg';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const admin_id = process.env.YOUR_BOT_CREATOR_CHAT_ID!;

const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));

// Реакция на команду /start
bot.onText(/\/start/, async (msg: any) => {
    const chatId = msg.chat.id;

    if (isAdmin(chatId)) {
        sendAdminMessage(chatId);
        return; // Выход из функции, если пользователь - администратор
    }

    loadUserData(chatId);
});

// Проверка тестовых запросов
bot.on('text', async (msg: any) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const userRef = db.ref(`users/${chatId}`);

    userRef.once('value', async (snapshot) => {
        const userData = snapshot.val();

        if (userData) {
            switch (userData.stage) {
                case 'phone':
                    handlePhoneInput(userRef, chatId, text);
                    break;
                case 'parentName':
                    handleParentNameInput(userRef, chatId, text);
                    break;
                case 'isMother':
                    handleIsMotherInput(userRef, chatId, text);
                    break;
                case 'checkChildren':
                    handleCheckChildren(userRef, chatId, text, userData);
                    break;
            }
        }
    });
});

export function sendMessage(chatId: number, text: string) {
    bot.sendMessage(chatId, text);
}