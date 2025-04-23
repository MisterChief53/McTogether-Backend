import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { Menu, MenuDocument } from '../schemas/menu.schema';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
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

  private async seedMenus() {
    try {
      this.logger.log('Starting to seed menus...');
      const testMenus = [
        {
          name: 'BigMac',
          price: 5.99,
          imageUrl: 'https://example.com/bigmac.jpg',
        },
        {
          name: 'Cheeseburger',
          price: 3.49,
          imageUrl: 'https://example.com/cheeseburger.jpg',
        },
        {
          name: 'French Fries',
          price: 2.99,
          imageUrl: 'https://example.com/fries.jpg',
        },
        {
          name: 'Coca-Cola',
          price: 1.99,
          imageUrl: 'https://example.com/coke.jpg',
        },
        {
          name: 'Chicken Nuggets',
          price: 4.99,
          imageUrl: 'https://example.com/nuggets.jpg',
        },
      ];
      
      let createdCount = 0;
      let existingCount = 0;

      this.logger.log(`Processing ${testMenus.length} test menus...`);
      for (const menu of testMenus) {
        this.logger.log(`Checking menu ${menu.name}...`);
        const existingMenu = await this.menuModel.findOne({ name: menu.name });

        if (!existingMenu) {
          this.logger.log(`Creating new menu ${menu.name}...`);
          await this.menuModel.create(menu);
          this.logger.log(`Created menu ${menu.name}`);
          createdCount++;
        } else {
          this.logger.log(`Menu ${menu.name} already exists`);
          existingCount++;
        }
      }  
    } catch (error) {
        this.logger.error('Error in seedMenus:', error);
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