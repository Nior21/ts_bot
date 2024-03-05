import { db } from './firebase';
import { bot } from './bot';

import dotenv from 'dotenv';
dotenv.config();
const admin_id = process.env.YOUR_BOT_CREATOR_CHAT_ID!;

interface Payment {
    name: string;
    date: string;
    amount: number;
    paymentDetails: {
        paymentDate: string;
        lastDigits: string;
        bank: string;
        realAmount: number;
        receiptSent: boolean;
    };
}

// Тестовый платеж
const paymentData = {
    name: 'Payment 1',
    date: '2024-02-26',
    amount: 100,
    paymentDetails: {
        paymentDate: '2024-02-26',
        lastDigits: '1234',
        bank: 'Some Bank',
        realAmount: 100,
        receiptSent: false
    }
}

// Проверка тестовых запросов
export const paymentDialog = (msg: any, stagesRef?: any) => {
    const chatId = msg.chat.id;
    const isAdmin = admin_id == chatId;

    if (isAdmin) {
        const inputArray = msg.text ? msg.text.split(' ') : []; // Собираем массив входных данных
        let name = ''
        if (stagesRef === undefined) { // Использую как способ отличать исходный и повторный запрос
            if (inputArray.length >= 2) { // Если параметры указаны сразу
                name = inputArray.slice(1).join(' ');
            } else { // Если ФИ ребенка не указали сразу
                bot.sendMessage(chatId, 'Укажите за какого ребенка планируется зар-ть платеж? Введите имя и/или фамилию ребенка. Если это повторная попытка, то проверьте корректность регистрации ребенка');
                stagesRef = db.ref(`users/${msg.chat.id}/stages`);
                stagesRef.update({
                    current: 'payment', payment: 'checkChildren'
                });
                return;
            }
        } else {// Если обращение повторное
            name = inputArray.join(' '); // Собираем ФИ уже без исходной команды
        }
        // Проверяем наличие ребенка
        const child_id = findChildByName(name); // Ищем в базе такого ребенка
        // Если нашли ребенка то проводим платеж
        if (child_id) {
            newPayment(child_id, paymentData);
            stagesRef.update({
                current: 'idle', payment: 'idle'
            });
            bot.sendMessage(chatId, 'Payment added successfully!');
        } else {
            bot.sendMessage(chatId, `Не удалось найти ребенка с именем или фамилией: ${name}. Повторите попытку или проверьте регистрацию`);
            stagesRef.update({
                current: 'payment', payment: 'checkChildren'
            });
        }
    } else { // Обычные пользователи не регистрируют платежи
        bot.sendMessage(chatId, "У вас недостаточно прав для выполнения этой операции. Регистрацией платежей занимается администратор системы");
    }
};

// Поиск ребенка в базе по имени и/или фамилии
function findChildByName(name: string) {
    const childrenRef = db.ref('children');
    childrenRef.once('value', (snapshot) => {
        const childrenData = snapshot.val();
        if (childrenData) {
            Object.keys(childrenData).forEach((childId) => {
                const child = childrenData[childId];
                if (name.toLowerCase().includes(child.name.toLowerCase()) || name.toLowerCase().includes(child.surname.toLowerCase())) {
                    return childId; // Найден ребенок по имени или фамилии
                }
            });
        }
    });
    return undefined;
}

function newPayment(child_id: string, payment_data: any) {
    const childRef = db.ref(`children/${child_id}`);
    childRef.child('payments').push(payment_data);
}