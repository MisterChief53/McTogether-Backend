import { Injectable } from '@nestjs/common';
import { Order } from './dto/order.dto';
import { Pay } from './dto/pay.dto';
import { MemberLeftGroup } from './dto/member-left-group.dto';


@Injectable()
export class PaymentsService {
    private orders: Order[] = [];

    async processOrder(orderDto: Order) {
        this.orders.push(orderDto);
        return { success: true };
    }
    
    async processPayment(payDto: Pay) {
        if (payDto.cardName === 'fail')
            return { success: false, message: 'Payment failed' };

        return { success: true };
    }
    
    async handleMemberLeft(memberLeftDto: MemberLeftGroup) {
        const { partyId, userEmail } = memberLeftDto;
        const order = this.orders.find(o => o.partyId === partyId);
        if (!order) {
            throw new Error('Order not found');
        }
        order.members = order.members
            .filter(member => member.userEmail !== userEmail);

        return { success: true, message: `Member ${(userEmail)} from the party` };
    }
}
