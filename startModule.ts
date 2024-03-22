// start.ts

import { db } from './firebaseModule';
import { bot } from './bot';
import { findObject, MyReturnValue } from './firebaseSearchModule'; // Импорт вашего модуля поиска детей

export const registration = (msg: any) => {
    const chatId = msg.chat.id;
    const userRef = db.ref(`users/${chatId}`);

    userRef.once('value', async (snapshot) => {
        const userData = snapshot.val();

        // Если пользователя нет в базе users, создаем новую запись
        if (!userData) {
            userRef.set({
                registered_on: new Date().toISOString(),
                stage: 'idle'
            });
            bot.sendMessage(chatId, 'Текущий пользователь не обнаружен в БД, создаем новую карточку...');
        }

        // Раз пользователь уже есть в базе users, то проверяем статус
        if (userData && userData.stage === 'waiting_child_name') {
            // Если пользователь уже ждет ответа на вопрос про ребенка, продолжаем с поиском
            findChildAndShowButtons(chatId, userData, msg.text);
        } else {
            bot.sendMessage(chatId, 'Введите имя вашего ребенка:'); // Затем запрашиваем имя ребенка у пользователя
            userRef.update({ stage: 'waiting_child_name' }); // Обновляем статус пользователю на ожидание имени ребенка
        }
    });
};

// Функция для поиска ребенка по имени и вывода кнопок выбора
function findChildAndShowButtons(chatId: number, userData: any, childName: string) {
    findObject(childName, 'child').then((searchResult: MyReturnValue) => {
        const matchedChildren = searchResult.result.map((result: any) => result.item.name);

        if (matchedChildren.length > 0) {
            const buttons = matchedChildren.map((childName: string) => ({
                text: childName,
                callback_data: `child_${childName}` // Используем префикс для идентификации действия
            }));
            const option = {
                reply_markup: {
                    inline_keyboard: [buttons]
                }
            };
            bot.sendMessage(chatId, 'Выберите своего ребенка из списка:', option);

            // Добавляем обработчик нажатий на кнопки
            bot.on('callback_query', (callbackQuery: any) => {
                const data: string = callbackQuery.data;
                if (data.startsWith('child_')) {
                    const selectedChild = data.replace('child_', ''); // Получаем выбранное имя ребенка
                    // Обновляем информацию о выбранном ребенке в базе данных
                    db.ref(`users/${chatId}`).update({
                        selected_child: selectedChild,
                        stage: 'idle' // Меняем статус на idle после выбора ребенка
                    });
                    showParentsForChild(chatId, selectedChild);
                }
            });
        } else {
            bot.sendMessage(chatId, 'По вашему запросу не найдено детей. Вы можете повторить поиск или добавить нового.');
        }
    });
}

// Функция для отображения найденных родителей ребенка и добавления связи с родителем
function showParentsForChild(chatId: number, childName: string) {
    // Реализация поиска родителей и логики связывания с выбранным ребенком
    // После выбора родителя можно обновить записи о связи родителя и ребенка в базе данных
    // и выдать кнопку для создания новой записи
}
