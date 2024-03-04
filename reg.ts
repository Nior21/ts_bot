// Проверка наличия привилегированных прав
export function isAdmin(chatId: string): boolean {
    return admin_id === chatId;
}

export function sendAdminMessage(chatId: number) {
    bot.sendMessage(chatId, `Вы зашли в систему с ролью администратора (chatId: ${chatId})`);
}

// Проверка и загрузка данных о пользователе
export function loadUserData(chatId: number) {
    const userRef = db.ref(`users/${chatId}`);

    userRef.once('value', async (snapshot) => {
        if (snapshot.exists()) {
            handleExistingUser(chatId, snapshot.val());
        } else {
            handleNewUser(chatId, userRef);
        }
    });
}

// Сообщение пользователю данных загруженных с БД
export function handleExistingUser(chatId: number, userData: any) {
    bot.sendMessage(chatId, `Запись для пользователя ${chatId} уже существует`);
    const userInfo = `Информация о пользователе ${chatId}:\n` +
        `Родитель: ${userData.phone} ${userData.parentName} (${userData.isMother ? 'мать' : 'отец'})\n`;

    if (userData.child_id) {
        const childrenIds = Array.isArray(userData.child_id) ? userData.child_id : [userData.child_id];
        childrenIds.forEach((childId: any) => {
            loadChildData(chatId, childId);
        });
    }
}

// Сообщение данных загруженных о ребенке с БД
export function loadChildData(chatId: number, childId: any) {
    const childRef = db.ref(`children/${childId}`);

    childRef.once('value', (childSnapshot) => {
        if (childSnapshot.exists()) {
            const childData = childSnapshot.val();
            const childInfo = `Ребенок: ${childData.name} ${childData.surname} (ДР: ${childData.birthday})`;
            bot.sendMessage(chatId, childInfo);
        }
    });
}

// Создание нового пользователя в БД
export function handleNewUser(chatId: number, userRef: any) {
    userRef.set({
        phone: 'empty',
        parentName: 'empty',
        isMother: 'empty',
        child_id: 'empty',
        stage: 'phone'
    });
    bot.sendMessage(chatId, 'Введите свой контактный номер телефона:');
}

// Вводим номер телефона
export function handlePhoneInput(userRef: any, chatId: number, text: string) {
    userRef.update({ phone: text, stage: 'parentName' });
    bot.sendMessage(chatId, 'Теперь введите ваше имя:');
}

// Вводим имя родителя
export function handleParentNameInput(userRef: any, chatId: number, text: string) {
    userRef.update({ parentName: text, stage: 'isMother' });
    bot.sendMessage(chatId, 'Укажите, кем вы приходитесь ребенку (мать/отец/бабушка/дедушка/брат/сестра/тетя/дядя):');
}

// Вводим кем является родственник ребенку
export function handleIsMotherInput(userRef: any, chatId: number, text: string) {
    userRef.update({ isMother: text, stage: 'checkChildren' });
    bot.sendMessage(chatId, 'Введите имя, фамилию и дату рождения ребенка (через пробел):');
}

// Вводим имя ребенка и проверяем наличие в БД
export function handleCheckChildren(userRef: any, chatId: number, text: string, userData: any) {
    const childData = text.split(' ');

    if (childData.length === 3) {
        const [name, surname, birthday] = childData;

        const childrenRef = db.ref('children');

        childrenRef.once('value', (snapshot) => {
            const childrenData = snapshot.val(); console.log("childrenData: ", childrenData)

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
                    userRef.update({ child_id: child_id, stage: 'completed' });
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
                    userRef.update({ child_id: newChildRef.key, stage: 'completed' });
                }
            }
        });
    }
}


export function registerUser(chatId: number, userData: any) {
    // Регистрация пользователя с заданными данными
    const userRef = db.ref(`users/${chatId}`);
    userRef.set(userData);
}