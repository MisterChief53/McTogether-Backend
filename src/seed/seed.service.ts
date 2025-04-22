import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting seed process...');
    await this.seedUsers();
    this.logger.log('Seed process completed');
  }

  private async seedUsers() {
    const exampleUsers = [
      { userId: 1, currency: 1000 },
      { userId: 2, currency: 800 },
      { userId: 3, currency: 1200 },
      { userId: 4, currency: 600 },
      { userId: 5, currency: 1500 },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const user of exampleUsers) {
      const existingUser = await this.userModel.findOne({ userId: user.userId });
      if (!existingUser) {
        await this.userModel.create(user);
        this.logger.log(`Created user ${user.userId} with ${user.currency} currency`);
        createdCount++;
      } else {
        this.logger.log(`User ${user.userId} already exists with ${existingUser.currency} currency`);
        existingCount++;
      }
    }

    this.logger.log(`Seed summary: ${createdCount} users created, ${existingCount} users already existed`);
  }
} 