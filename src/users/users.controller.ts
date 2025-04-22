import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(Number(userId));
  }

  @Patch(':userId/currency')
  async updateCurrency(
    @Param('userId') userId: string,
    @Body('amount') amount: number,
  ) {
    return this.usersService.updateCurrency(Number(userId), amount);
  }
} 