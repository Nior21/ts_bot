export function formatDate(date: Date | string): string {
    // Запрашиваем день недели вместе с длинным форматом даты
    let dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    };

    if (date instanceof Date) {
        return date.toLocaleString('ru-RU', dateOptions);
    } else if (typeof date === 'string') {
        const formattedDate = new Date(date).toLocaleString('ru-RU', dateOptions);
        if (formattedDate !== 'Invalid Date') {
            return formattedDate;
        }
    }

    return date; // Возвращаем саму строку date в случае, если дата не может быть отформатирована
}


export function escapeMarkdownV2(text: string, escapeQuotes: boolean = true): string {
    let specialCharacters = ['_', '*', '[', ']', '(', ')', ' ', '`', '>', '#', '+', '-', '=', '|', '', '', '.', '!'];

    if (!escapeQuotes) {
        specialCharacters = specialCharacters.filter(char => char !== '`' && char !== '*');
    }

    let escapedText = '';
    for (let i = 0; i < text.length; i++) {
        if (specialCharacters.includes(text[i])) {
            escapedText += '\\' + text[i];
        } else {
            escapedText += text[i];
        }
    }

    return escapedText;
}


export function mono(text: string): string {
    return '`' + text + '`';
}

export function bolt(text: string): string {
    return '*' + text + '*';
}