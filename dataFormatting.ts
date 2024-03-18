interface ChildData {
    id: string;
    parents: string[];
    name: string;
    birthday: Date;
    gender: 'м' | 'ж';
}

interface ParentData {
    id: string;
    number: number;
    isMain: boolean;
    name: string;
}

interface CollectionData {
    collection_amount: number;
    collection_name: string;
}

interface PaymentData {
    collectionId: string;
    recipientName: string;
    referenceNumber: string;
    amount: number;
    date: Date;
    paymentMethod: string;
    notes: string;
    collection: CollectionData;
}

interface FullData {
    child: ChildData;
    parent: ParentData;
    payments: PaymentData[];
}

export function formatDataForDisplay(data: FullData): string {
    let formattedData = `Child Data:\n`;
    formattedData += `ID: ${data.child.id}\n`;
    formattedData += `Parents: ${data.child.parents.join(", ")}\n`;
    formattedData += `Name: ${data.child.name}\n`;
    formattedData += `Birthday: ${data.child.birthday.toISOString()}\n`;
    formattedData += `Gender: ${data.child.gender === 'м' ? 'мужской' : 'женский'}\n\n`;

    formattedData += `Parent Data:\n`;
    formattedData += `ID: ${data.parent.id}\n`;
    formattedData += `Number: ${data.parent.number}\n`;
    formattedData += `Is Main: ${data.parent.isMain ? 'Да' : 'Нет'}\n`;
    formattedData += `Name: ${data.parent.name}\n\n`;

    formattedData += `Payments:\n`;
    data.payments.forEach((payment, index) => {
        formattedData += `Payment ${index + 1}:\n`;
        formattedData += `Collection ID: ${payment.collectionId}\n`;
        formattedData += `Recipient Name: ${payment.recipientName}\n`;
        formattedData += `Reference Number: ${payment.referenceNumber}\n`;
        formattedData += `Amount: ${payment.amount}\n`;
        formattedData += `Date: ${payment.date.toISOString()}\n`;
        formattedData += `Payment Method: ${payment.paymentMethod}\n`;
        formattedData += `Notes: ${payment.notes}\n`;

        formattedData += `Collection Data:\n`;
        formattedData += `Collection Amount: ${payment.collection.collection_amount}\n`;
        formattedData += `Collection Name: ${payment.collection.collection_name}\n\n`;
    });

    return formattedData;
}