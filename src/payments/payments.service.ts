import { Head, Injectable } from '@nestjs/common';
import axios from 'axios';

import { Order } from './dto/order.dto';
import { Pay } from './dto/pay.dto';
import { MemberLeftGroup } from './dto/member-left-group.dto';

const POINTS_PER_MONEY = 5; // points per money unit
const POINTS_PER_MEMBER = 10; // points per member
const PAYMENT_API = 'http://192.168.100.13:3001/api/v1';

@Injectable()
export class PaymentsService {
    private orders: Order[] = [];
    private payments = new Map<string, Set<string>>();

    async processOrder(orderDto: Order) {
        this.orders.push(orderDto);
        // Add the order and the members to the payments map
        this.payments.set(orderDto.orderId,
            new Set(orderDto.members.map(member => member.userEmail)));
        return { success: true };
    }

    async processPayment(payDto: Pay) {
        if (payDto.cardName === 'fail')
            // TODO change field success to false to simulate a failed payment
            return { success: false, message: 'Payment failed' };

        try {
            // Call mock API
            const client_id = payDto.userEmail;
            console.log('Obtaining authentication token...');
            const token = await axios.post(`${PAYMENT_API}/payments/auth/token`, 
                { client_id: client_id },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-mcd-api-key': 'test_mcd_api_key_123',
                    }
                }
            );

            if (token.status !== 201) {
                return { success: false, message: `Failed to obtain auth token. Returned ${token.status}` };
            }
            
            console.log('Obtained authentication token OK');
            console.log('Calling mock API...');

            const paymentResponse = await axios.post(`${PAYMENT_API}/payments`,
                {
                    checkout_id: payDto.orderId,
                    buyer_info: {
                        email: payDto.userEmail,
                        name: payDto.cardName,
                    },
                    psp: "stripe",
                    psp_info: {
                        transaction_id: payDto.orderId,
                        success: payDto.cardName !== 'fail',
                    },
                    payment_orders: [
                        {
                            payment_order_id: payDto.orderId,
                            client_id: payDto.userEmail,
                            location_id: "MX",
                            order_info: {
                                items: ["burger", "fries"]
                            },
                            amount: payDto.paymentAmount,
                            currency: 'USD',
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.data.access_token}`,
                    },
                }
            );

            console.log('Payment response:', paymentResponse.data);

            if (paymentResponse.status !== 201) {
                return { success: false, message: 'Payment failed' };
            }

            // Remove the user from the payments map
            const order = this.orders.find(o => o.orderId === payDto.orderId);
            if (!order) {
                return { success: false, message: 'Order not found' };
            }

            this.payments.get(order.orderId)?.delete(payDto.userEmail);

            // Check if all members have paid
            // wait until there are no members in the payments map
            // continuously check if the payments map is empty until a timeout of 5 minutes
            const timeout = Date.now() + 5 * 60 * 1000;
            while ((this.payments.get(order.orderId)?.size ?? 0) > 0) {
                if (Date.now() > timeout) {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // compute the reward points based on the payment amount and the group size
            const groupSize = order.members.length - (this.payments.get(order.orderId)?.size ?? 0);
            const paymentAmount = payDto.paymentAmount;

            const rewards = groupSize * POINTS_PER_MEMBER + paymentAmount * POINTS_PER_MONEY;

            return { success: true, rewards: rewards };
        } catch (error) {
            console.error('Error calling mock API:', error);
            return { success: false, message: error };
        }
    }

    async handleMemberLeft(memberLeftDto: MemberLeftGroup) {
        const { partyId, userEmail } = memberLeftDto;
        // This only works if the party only has one order.
        // A party should not have many orders at the same time.
        const order = this.orders.find(o => o.partyId === partyId);
        if (!order) {
            throw new Error('Order not found');
        }
        order.members = order.members
            .filter(member => member.userEmail !== userEmail);
        // Remove the member from the payments map
        this.payments.get(order.orderId)?.delete(userEmail);
        // If the member is the last one in the group, remove the order
        if (order.members.length === 0) {
            this.orders = this.orders.filter(o => o.orderId !== order.orderId);
            this.payments.delete(order.orderId);
        }

        return { success: true, message: `Member ${(userEmail)} from the party` };
    }
}
