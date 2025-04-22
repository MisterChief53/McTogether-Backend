import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findOne(userId: number): Promise<UserDocument> {
    this.logger.log(`Finding user with ID: ${userId}`);
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async updateCurrency(userId: number, amount: number): Promise<UserDocument> {
    this.logger.log(`Updating currency for user ${userId} by ${amount}`);
    const user = await this.findOne(userId);
    user.currency += amount;
    const updatedUser = await user.save();
    this.logger.log(`Updated currency for user ${userId}. New balance: ${updatedUser.currency}`);
    return updatedUser;
  }

  async updateGroup(userId: number, groupId: string, role: 'leader' | 'member'): Promise<UserDocument> {
    this.logger.log(`Updating group for user ${userId}. Group: ${groupId}, Role: ${role}`);
    const user = await this.findOne(userId);
    user.groupId = groupId;
    user.role = role;
    const updatedUser = await user.save();
    this.logger.log(`Updated group for user ${userId}`);
    return updatedUser;
  }

  async leaveGroup(userId: number): Promise<UserDocument> {
    this.logger.log(`User ${userId} leaving group`);
    const user = await this.findOne(userId);
    user.groupId = undefined;
    user.role = undefined;
    const updatedUser = await user.save();
    this.logger.log(`User ${userId} left group`);
    return updatedUser;
  }
} 