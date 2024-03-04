interface Payment {
    name: string;
    date: string;
    amount: number;
    paymentDetails: {
        paymentDate: string;
        lastDigits: string;
        bank: string;
        realAmount: number;
        receiptSent: boolean;
    };
}

export function addPayment(childId: string, payment: Payment) {
    // Добавление платежа к указанному ребенку
    const childRef = db.ref(`children/${childId}`);
    childRef.child('payments').push(payment);
}