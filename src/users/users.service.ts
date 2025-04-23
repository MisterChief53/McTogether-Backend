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

  async findById(id: string): Promise<UserDocument> {
    this.logger.log(`Finding user with ID: ${id}`);
    const user = await this.userModel.findById(id);
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOne(userId: string): Promise<UserDocument> {
    this.logger.log(`Finding user with ID: ${userId}`);
    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async updateCurrency(userId: string, amount: number): Promise<UserDocument> {
    this.logger.log(`Updating currency for user ${userId} by ${amount}`);
    const user = await this.findOne(userId);
    user.currency += amount;
    const updatedUser = await user.save();
    this.logger.log(`Updated currency for user ${userId}. New balance: ${updatedUser.currency}`);
    return updatedUser;
  }

  async updateGroup(userId: string, groupId: string | null): Promise<UserDocument> {
    this.logger.log(`Updating group for user ${userId}. Group: ${groupId}`);
    const user = await this.findOne(userId);
    user.groupId = groupId;
    const updatedUser = await user.save();
    this.logger.log(`Updated group for user ${userId}`);
    return updatedUser;
  }
} 