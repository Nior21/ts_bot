export interface ChildData {
    id: string;
    parents: string[];
    name: string;
    birthday: string;
    gender: 'м' | 'ж';
}

export interface ParentData {
    id: string;
    number: number;
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
    let formattedData = `Child Data:\n`;
    formattedData += `ID: ${data.child.id}\n`;
    formattedData += `Name: ${data.child.name}\n`;
    formattedData += `Birthday: ${data.child.birthday}\n`;
    formattedData += `Gender: ${data.child.gender === 'м' ? 'мужской' : 'женский'}\n\n`;

    data.parents.forEach(function (arr) {
        formattedData += `Parent Data:\n`;
        formattedData += `ID: ${arr.id}\n`;
        formattedData += `Number: ${arr.number}\n`;
        formattedData += `Is Main: ${arr.isMain ? 'Да' : 'Нет'}\n`;
        formattedData += `Name: ${arr.name}\n\n`;
    });

    formattedData += `Payments:\n`;
    data.payments.forEach((payment, index) => {
        formattedData += `${JSON.stringify(index)}: ${JSON.stringify(payment)}\n`
        // formattedData += `Payment ${index + 1}:\n`;
        // //formattedData += `Collection ID: ${payment.collection_id}\n`;
        // formattedData += `Reference Number: ${payment.bank_account_or_card_number}\n`;
        // formattedData += `Amount: ${payment.collection_amount}\n`;
        // formattedData += `Date: ${payment.payment_date}\n`;
        // formattedData += `Payment Method: ${payment.received_bank}\n`;
        // formattedData += `Notes: ${payment.comments}\n`;

        // formattedData += `Collection Data:\n`;
        // formattedData += `Collection Amount: ${payment.collection.collection_amount}\n`;
        // formattedData += `Collection Name: ${payment.collection.collection_name}\n\n`;
    });

    return formattedData;
}