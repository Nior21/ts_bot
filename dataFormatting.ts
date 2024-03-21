export interface ChildData {
    id: string;
    parents: string[];
    name: string;
    birthday: string;
    gender: 'м' | 'ж';
}

export interface ParentData {
    id: string;
    number: string;
    isMain: boolean;
    name: string;
}

export interface CollectionData {
    collection_amount: number;
    collection_name: string;
}

export interface PaymentData {
    collection_id: string;
    name: string;
    bank_account_or_card_number: string;
    collection_amount: number;
    payment_date: string;
    received_bank: string;
    comments: string;
    collection: CollectionData;
}

export interface FullData {
    child: ChildData;
    parents: ParentData[];
    payments: PaymentData[];
}

export function formatDataForDisplay(data: FullData): string {
    let formattedData = bolt(`Ребенок:`) + '\n';
    formattedData += `${mono(data.child.name)} (${data.child.gender === 'м' ? 'м' : 'ж'})\n`;
    formattedData += `ДР: ${mono(formatDate(data.child.birthday))}\n\n`;

    data.parents.forEach(function (arr) {
        formattedData += bolt(`Родители:`) + '\n';
        formattedData += `${mono(arr.number)} ${mono(arr.name)}${arr.isMain ? ' (осн. контакт)' : ''}\n\n`;
    });

    formattedData += bolt(`Платежи:`) + '\n';
    data.payments.forEach((payment, index) => {
        if (payment.collection_amount) {
            formattedData += bolt(`${index + 1}. ${payment.collection.collection_name} (${mono(String(payment.collection.collection_amount))} руб.):`) + '\n';
            formattedData += `Поступило: ${mono(String(payment.collection_amount))} руб.`;
            formattedData += payment.payment_date ? ` [${formatDate(payment.payment_date)}]\n` : `\n`;
            formattedData += `С карты/счета № ${mono(payment.bank_account_or_card_number)} на ${payment.received_bank}\n`;
            formattedData += payment.comments ? `${payment.comments}\n\n` : `\n`;
        } else {
            formattedData += bolt(`${index + 1}. ${payment.collection.collection_name} (${payment.collection.collection_amount} руб.):`) + '\n';
            formattedData += mono('Данные о платеже отсутствуют') + '\n\n';
        }
    });

    return formattedData;
}

function formatDate(date: Date | string): string {
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


function mono(text: string): string {
    return '`' + text + '`';
}

function bolt(text: string): string {
    return '*' + text + '*';
}