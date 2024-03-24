import { Data } from './database';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN!;

export const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));

bot.on('text', async (msg: any) => {
    const isCommand = msg.text.match(/\/\S+/g) !== null;
    const inputArray = msg.text ? msg.text.split(' ') : [];
    const [command, ...rest] = inputArray;

    const currentUser = new Data(`users/${msg.chat.id}`);
    try {
        let dataExists = await currentUser.get();

        if (!dataExists) {
            await currentUser.set({
                [msg.chat.id]: {
                    registered_on: new Date().toISOString(),
                    stage: 'idle'
                }
            });
            console.log('Created a new user with ID:', msg.chat.id);
            return `Created a new user with ID: ${msg.chat.id}`;
        } else {
            console.log(`Welcome back! Account with ID: ${msg.chat.id} successfully initialized.`);
            return `Welcome back! Account with ID: ${msg.chat.id} successfully initialized.`;
        }
    } catch (error) {
        console.error('Error handling the message:', error);
        return 'An error occurred while processing your request.';
    }

});