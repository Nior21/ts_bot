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