import { db } from './firebaseModule';
import { bot } from './bot';
import { findObject, MyReturnValue } from './firebaseSearchModule';
import { ParentData, PaymentData, FullData, escapeMarkdownV2, formatDataForDisplay } from './dataFormatting'

export const check = (name: string, msg: any) => {
    findObject(name, 'child').then((result) => { // Ищем ребенка полнотекстовым поиском
        if (result.child_id) { // Найден child_id, получаем данные о ребенке
            const childRef = db.ref(`children/${result.child_id}`);
            childRef.once('value', (childSnapshot) => {
                const childData = childSnapshot.val();

                const parentPromises: Promise<ParentData>[] = Object.keys(childData.parents).map((parentId: string) => {
                    return new Promise<ParentData>((resolve, reject) => {
                        const parentRef = db.ref(`parents/${parentId}`);
                        parentRef.once('value', (parentSnapshot) => {
                            resolve(parentSnapshot.val());
                        });
                    });
                });

                Promise.all(parentPromises).then((parentsData) => {
                    const paymentPromises: Promise<PaymentData>[] = Object.keys(childData.payments).map((paymentId: string) => {
                        return new Promise<PaymentData>((resolve, reject) => {
                            const paymentRef = db.ref(`children/${result.child_id}/payments/${paymentId}`);
                            paymentRef.once('value', (paymentSnapshot) => {
                                const paymentData = paymentSnapshot.val();
                                const collectionRef = db.ref(`collections/${paymentData.collection_id}`);
                                collectionRef.once('value', (collectionSnapshot) => {
                                    const collectionData = collectionSnapshot.val();

                                    const payment: PaymentData = {
                                        collection_id: paymentData.collection_id,
                                        name: paymentData.collection_name,
                                        bank_account_or_card_number: paymentData.bank_account_or_card_number,
                                        collection_amount: paymentData.collection_amount,
                                        payment_date: paymentData.payment_date,
                                        received_bank: paymentData.received_bank,
                                        comments: paymentData.comments,
                                        collection: collectionData // Связываем данные платежей с данными коллекций
                                    };
                                    resolve(payment);
                                });
                            });
                        });
                    });

                    Promise.all(paymentPromises).then((paymentsData) => {
                        const fullData: FullData = {
                            child: childData,
                            parents: parentsData,
                            payments: paymentsData
                        };

                        const formattedData = escapeMarkdownV2(formatDataForDisplay(fullData), false);
                        console.log('Полные данные:', formattedData);
                        bot.sendMessage(msg.chat.id, formattedData, { parse_mode: 'MarkdownV2' });
                    });
                });
            });
        } else {
            bot.sendMessage(msg.chat.id, 'Ребенок не найден');
        }
    }).catch((error) => {
        bot.sendMessage(msg.chat.id, `Error: ${error}`);
    });
}