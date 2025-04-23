import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private connection: any,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Waiting for MongoDB connection...');
      await this.connection;
      this.logger.log('MongoDB connection established, starting seed process...');
      await this.seedUsers();
      this.logger.log('Seed process completed');
    } catch (error) {
      this.logger.error('Error during seed process:', error);
      throw error;
    }
  }

  private async seedUsers() {
    try {
      this.logger.log('Starting to seed users...');
      const testUsers = [
        {
          email: 'test1@example.com',
          username: 'test1',
          password: 'password1',
          currency: 1000,
        },
        {
          email: 'test2@example.com',
          username: 'test2',
          password: 'password2',
          currency: 800,
        },
        {
          email: 'test3@example.com',
          username: 'test3',
          password: 'password3',
          currency: 1200,
        },
        {
          email: 'test4@example.com',
          username: 'test4',
          password: 'password4',
          currency: 600,
        },
        {
          email: 'test5@example.com',
          username: 'test5',
          password: 'password5',
          currency: 1500,
        },
      ];

      let createdCount = 0;
      let existingCount = 0;

      this.logger.log(`Processing ${testUsers.length} test users...`);

      for (const user of testUsers) {
        this.logger.log(`Checking user ${user.username}...`);
        const existingUser = await this.userModel.findOne({
          $or: [{ email: user.email }, { username: user.username }],
        });

        if (!existingUser) {
          this.logger.log(`Creating new user ${user.username}...`);
          // Hash password before creating user
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await this.userModel.create({
            ...user,
            password: hashedPassword,
          });
          this.logger.log(`Created user ${user.username} with ${user.currency} currency`);
          createdCount++;
        } else {
          this.logger.log(`User ${user.username} already exists with ${existingUser.currency} currency`);
          existingCount++;
        }
      }

      this.logger.log(`Seed summary: ${createdCount} users created, ${existingCount} users already existed`);
    } catch (error) {
      this.logger.error('Error in seedUsers:', error);
      throw error;
    }
  }
} 