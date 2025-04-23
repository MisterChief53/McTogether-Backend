import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Order } from './dto/order.dto';
import { Pay } from './dto/pay.dto';
import { MemberLeftGroup } from './dto/member-left-group.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('make-order')
  async makeOrder(@Body() makeOrderDto: Order) {
    return this.paymentsService.processOrder(makeOrderDto);
  }

  @Post('pay')
  async pay(@Body() payDto: Pay) {
    return this.paymentsService.processPayment(payDto);
  }

  @Post('member-left')
  async memberLeft(@Body() memberLeftDto: MemberLeftGroup) {
    return this.paymentsService.handleMemberLeft(memberLeftDto);
  }
}