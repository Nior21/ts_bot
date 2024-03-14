import paymentsJSON from "./payments.json";
import { findObject } from './firebaseSearchModule'; // Импорт вашего модуля поиска
import { db } from './firebaseModule';

// Перебираем массив платежей и ищем соответствие детей
for (let i = 1; i < paymentsJSON.length; i++) { // строки
    findObject(String(paymentsJSON[i][1]), "child").then(({
        child_id }) => {

        if (child_id) {
            getData(child_id, (refData: any) => {
                //console.log(paymentsJSON[i][0], child_id, refData);
                console.log(setData(refData, paymentsJSON[i])); // Добавление информации по платежам к данным ребенка
            })
        }
    });
}

// Получаем данные по ребенку чтобы дополнить их
function getData(child_id: string, callback: (refData: any) => void) {
    const ref = db.ref(`children/${child_id}`);
    ref.once('value', async (snapshot: any) => {
        const refData = snapshot.val();
        callback(refData);
    });
}

function setData(data: any, payments: any[]): string {
    // Проверяем, существует ли свойство payments в объекте data, если нет, создаем его как пустой массив
    if (!data.payments) {
        data.payments = {};
    }

    // Генерируем payment_id
    const paymentName = 'payment_' + generateRandomKey(16);

    // Добавляем информацию по платежам из массива paymentsJSON к объекту data
    const paymentData = {
        collection_id: payments[0],
        name: payments[1],
        bank_account_or_card_number: payments[2],
        collection_amount: payments[3],
        payment_date: payments[4],
        received_bank: payments[5],
        comments: payments[6]
    };

    data.payments[paymentName] = paymentData;

    // Возвращаем обновленные данные в формате JSON
    return data;
}

function generateRandomKey(len: number) {
    var password = "";
    var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    return password;
}