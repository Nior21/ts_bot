import paymentsJSON from "./payments.json";
import { findObject } from './firebaseSearchModule'; // Импорт вашего модуля поиска
import { db } from './firebaseModule';

// Перебираем массив платежей и ищем соответствие детей
for (let i = 1; i < paymentsJSON.length; i++) {
    findObject(String(paymentsJSON[i][1]), "child").then(({ child_id }) => {
        if (child_id) {
            getData(child_id, (refData: any) => {
                setData(child_id, paymentsJSON[i]); // Отправка данных о платеже в базу данных Firebase
            });
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

function setData(childId: string, payment: any) {
    const paymentData = {
        collection_id: payment[0],
        name: payment[1],
        bank_account_or_card_number: payment[2],
        collection_amount: payment[3],
        payment_date: payment[4],
        received_bank: payment[5],
        comments: payment[6]
    };

    const paymentName = 'payment_' + generateRandomKey(16);

    // Отправляем данные о платеже в Firebase для соответствующего ребенка
    db.ref(`children/${childId}/payments/${paymentName}`).set(paymentData);
}


function generateRandomKey(len: number) {
    var password = "";
    var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    return password;
}