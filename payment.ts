import { db } from './firebaseModule';
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

// Функция для /payment без параметров
export function paymentWithoutParam(msg: any) {
    // Без параметров я должен вызвать запрос и изменить статусы
    const isAdmin = admin_id == msg.chat.id;
    if (isAdmin) {
        console.log('>>> Первый вызов без параметров. ФИ ребенка не указали сразу');
        bot.sendMessage(msg.chat.id, 'Укажите за какого ребенка планируется зар-ть платеж? Введите имя и/или фамилию ребенка. Если это повторная попытка, то проверьте корректность регистрации ребенка');
        const stagesRef = db.ref(`users/${msg.chat.id}/stages`);
        stagesRef.update({
            current: 'payment', payment: 'checkChildren'
        });
    }
}

// Функция для /payment с параметрами
export function paymentWithParam(msg: any, inputArray: any) {
    // С параметрами я сразу собираю ИФ ребенка и ищу в базе
    // Если не нахожу отправляю на повторный ввод
    const isAdmin = admin_id == msg.chat.id;
    if (isAdmin) {
        console.log('>>> Если параметры указаны сразу');
        const name = inputArray.slice(1).join(' ');
        // Проверяем наличие ребенка
        findChildByName(name, (child_id: string | undefined) => {
            handleChildId(child_id, msg);
        });
    }
}

// Функция для повторного обращения с указанием имени
export function paymentRepeated(msg: any) {
    // После повторного надо проверить ребенка и отправить на повтор если неуспех
    // Проверяем наличие ребенка
    const isAdmin = admin_id == msg.chat.id;
    if (isAdmin) {
        console.log('>>>> Если обращение повторное');
        findChildByName(msg.text, (child_id: string | undefined) => {
            handleChildId(child_id, msg);
        });
    }
}

// Проверка тестовых запросов
export function paymentDialog(msg: any, stagesRef?: any) {
    console.log('>>> Запущен paymentDialog')
    const chatId = msg.chat.id;
    const isAdmin = admin_id == chatId;

    if (isAdmin) {
        const inputArray = msg.text ? msg.text.split(' ') : []; // Собираем массив входных данных
        let name = ''

        if (stagesRef === undefined) { // Отличаем исходный запрос


            return;
        } else { // Если обращение повторное
            console.log('>>>> Если stagesRef !== undefined');
            name = inputArray.join(' '); // Собираем ФИ уже без исходной команды
            // Проверяем наличие ребенка
            findChildByName(name, (child_id: string | undefined) => {
                handleChildId(child_id, msg);
            });
            return;
        }
    } else { // Обычные пользователи не регистрируют платежи
        bot.sendMessage(chatId, "У вас недостаточно прав для выполнения этой операции. Регистрацией платежей занимается администратор системы");
    }
};

// Поиск ребенка в базе по имени и/или фамилии
function findChildByName(name: string, callback: (child_id: string | undefined) => void) {
    console.log('>>>>> Запущена findChildByName');
    const childrenRef = db.ref('children');
    childrenRef.once('value', (snapshot) => {
        const childrenData = snapshot.val();
        let child_id = undefined;
        let found = false;

        if (childrenData) {
            Object.keys(childrenData).forEach((childId) => {
                const child = childrenData[childId];
                if (!found && (name.toLowerCase().includes(child.name.toLowerCase()) || name.toLowerCase().includes(child.surname.toLowerCase()))) {
                    child_id = childId; // Найден ребенок по имени или фамилии
                    found = true;
                }
            });
        }
        callback(child_id);
    });
}

function handleChildId(child_id: string | undefined, msg: any) {
    console.log('>>>>>> Запущена handleChildId');
    const stagesRef = db.ref(`users/${msg.chat.id}/stages`);
    if (child_id != undefined) {
        newPayment(child_id, paymentData); // Если нашли ребенка то проводим платеж
        stagesRef.update({
            current: 'idle', payment: 'idle'
        });
        bot.sendMessage(msg.chat.id, 'Payment added successfully!');
    } else {
        bot.sendMessage(msg.chat.id, `Не удалось найти ребенка с именем или фамилией: ${msg.text}. Повторите попытку или проверьте регистрацию`);
        stagesRef.update({
            current: 'payment', payment: 'checkChildren'
        });
    }
}

function newPayment(child_id: string, payment_data: any) {
    const childRef = db.ref(`children/${child_id}`);
    childRef.child('payments').push(payment_data);
}