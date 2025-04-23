export interface Order {
    partyId: string;
    orderId: string;
    restaurantId: string;
    members: {
        userEmail: string;
        items: { menuItemId: string; quantity: number }[];
    }[]
}