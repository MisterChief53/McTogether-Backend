export interface Pay {
    userEmail: string;
    partyId: string;
    orderId: string;
    paymentAmount: number;
    paymentMethod: string; // always "CARD"
    cardToken: string; // tokenized card number
    cardExpiry: string;
    cardVerificationToken: string;
    cardName: string;
}