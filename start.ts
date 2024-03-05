import { db } from './firebase';
import { bot } from './bot';

import dotenv from 'dotenv';
dotenv.config();
const admin_id = process.env.YOUR_BOT_CREATOR_CHAT_ID!;

// Запуск регистрации по команде /start
export const registration = (msg: any) => {
    const chatId = msg.chat.id;
    const isAdmin = admin_id === chatId; // Проверка наличия привилегированных прав
    if (isAdmin) bot.sendMessage(chatId, `Вы зашли в систему с ролью администратора (chatId: ${chatId})`);

    const userRef = db.ref(`users/${chatId}`); // Пробуем получить данные о текущем пользователе с БД
    userRef.once('value', async (snapshot) => {
        // Проверяем наличие пользователя и загружаем данные если есть
        if (snapshot.exists()) {
            bot.sendMessage(chatId, `Запись для пользователя ${chatId} уже существует`);
            handleExistingUser(chatId, snapshot.val());
        } else {
            handleNewUser(chatId, userRef);
        }
    });
}

// Проверка тестовых запросов
export const regDialogs = (msg: any, stagesRef: any) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    const userRef = db.ref(`users/${chatId}`);

    userRef.once('value', async (snapshot) => {
        const userData = snapshot.val();

        if (userData) {
            switch (userData.stages.registration) {
                case 'phone':
                    handlePhoneInput(userRef, chatId, text, stagesRef);
                    break;
                case 'parentName':
                    handleParentNameInput(userRef, chatId, text, stagesRef);
                    break;
                case 'isMother':
                    handleIsMotherInput(userRef, chatId, text, stagesRef);
                    break;
                case 'checkChildren':
                    handleCheckChildren(userRef, chatId, text, stagesRef);
                    break;
            }
        }
    });
};

// Сообщение пользователю данных загруженных с БД
function handleExistingUser(chatId: number, userData: any) {
    const userInfo = `Информация о пользователе ${chatId}:\n` +
        `Родитель: ${userData.phone} ${userData.parentName} (${userData.isMother ? 'мать' : 'отец'})\n`;

    if (userData.child_id) {
        const childrenIds = Array.isArray(userData.child_id) ? userData.child_id : [userData.child_id];
        childrenIds.forEach((childId: any) => {
            loadChildData(chatId, childId);
        });
    }
}

// Создание нового пользователя в БД
function handleNewUser(chatId: number, userRef: any) {
    userRef.set({
        phone: 'empty',
        parentName: 'empty',
        isMother: 'empty',
        child_id: 'empty',
        stages: {
            current: 'registration',
            registration: 'phone',
            payment: 'idle'
        }
    });
    bot.sendMessage(chatId, 'Введите свой контактный номер телефона:'); // Старт диалога
}

// Вводим имя ребенка и проверяем наличие в БД
function handleCheckChildren(userRef: any, chatId: number, text: string, stagesRef: any) {
    const childData = text.split(' ');

    if (childData.length === 3) {
        const [name, surname, birthday] = childData;

        const childrenRef = db.ref('children');

        childrenRef.once('value', (snapshot) => {
            const childrenData = snapshot.val();

            if (childrenData) {
                let child_id: any = null;
                Object.values(childrenData).forEach((child: any, id: number) => {
                    if (child.name === name && child.surname === surname && child.birthday === birthday) {
                        // Если ребенок найден
                        child_id = Object.keys(childrenData)[id];
                        bot.sendMessage(chatId, `Ребенок найден в базе данных: ${name} ${surname} ${birthday} и сохранен в карточку родителя.`);
                        return;
                    }
                });

                if (child_id) {
                    // Обновляем данные пользователя с child_id, если ребенок найден
                    userRef.update({ child_id: child_id });
                    stagesRef.update({ registration: 'completed' });
                } else {
                    // Если ребенок не найден
                    bot.sendMessage(chatId, `Ребенок ${name} ${surname} с указанной датой рождения не найден. Он будет добавлен в базу данных.`);

                    const newChildRef = childrenRef.push();
                    newChildRef.set({
                        name: name,
                        surname: surname,
                        birthday: birthday
                    });

                    // Обновляем данные пользователя с новым child_id
                    userRef.update({ child_id: newChildRef.key });
                    stagesRef.update({ registration: 'completed' });
                }
            }
        });
    }
}

// Сообщение данных загруженных о ребенке с БД
function loadChildData(chatId: number, childId: any) {
    const childRef = db.ref(`children/${childId}`);

    childRef.once('value', (childSnapshot) => {
        if (childSnapshot.exists()) {
            const childData = childSnapshot.val();
            const childInfo = `Ребенок: ${childData.name} ${childData.surname} (ДР: ${childData.birthday})`;
            bot.sendMessage(chatId, childInfo);
        }
    });
}

// Вводим номер телефона
function handlePhoneInput(userRef: any, chatId: number, text: string, stagesRef: any) {
    userRef.update({ phone: text });
    stagesRef.update({ registration: 'parentName' });
    bot.sendMessage(chatId, 'Теперь введите ваше имя:');
}

// Вводим имя родителя
function handleParentNameInput(userRef: any, chatId: number, text: string, stagesRef: any) {
    userRef.update({ parentName: text });
    stagesRef.update({ registration: 'isMother' });
    bot.sendMessage(chatId, 'Укажите, кем вы приходитесь ребенку (мать/отец/бабушка/дедушка/брат/сестра/тетя/дядя):');
}

// Вводим кем является родственник ребенку
function handleIsMotherInput(userRef: any, chatId: number, text: string, stagesRef: any) {
    userRef.update({ isMother: text });
    stagesRef.update({ registration: 'checkChildren' });
    bot.sendMessage(chatId, 'Введите имя, фамилию и дату рождения ребенка (через пробел):');
}