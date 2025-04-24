import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { Menu, MenuDocument } from '../schemas/menu.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { UserInteractionService } from '../services/user-interaction.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
    @InjectConnection() private connection: any,
    private userInteractionService: UserInteractionService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Waiting for MongoDB connection...');
      await this.connection;
      this.logger.log('MongoDB connection established, starting seed process...');
      await this.seedUsers();
      await this.seedMenus();
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
          price: 31.00,
          imageUrl: 'https://example.com/images/bigmac.jpg',
        },
        {
          name: 'McFeast',
          price: 35.00,
          imageUrl: 'https://example.com/images/mcfeast.jpg',
        },
        {
          name: 'McChicken',
          price: 25.00,
          imageUrl: 'https://example.com/images/mcchicken.jpg',
        },
        {
          name: 'McFries',
          price: 20,
          imageUrl: 'https://example.com/images/mcfries.jpg',
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
          email: 'rodrigo@example.com',
          username: 'rodrigo',
          password: 'rodrigo',
          currency: 1000,
        },
        {
          email: 'mikel@example.com',
          username: 'mikel',
          password: 'mikel',
          currency: 800,
        },
        {
          email: 'evelyn@example.com',
          username: 'evelyn',
          password: 'evelyn',
          currency: 1200,
        },
        {
          email: 'francisco@example.com',
          username: 'francisco',
          password: 'francisco',
          currency: 600,
        },
        {
          email: 'angel@example.com',
          username: 'angel',
          password: 'angel',
          currency: 1500,
        },
      ];

      let createdCount = 0;
      let existingCount = 0;
      const createdUserIds: string[] = [];

      this.logger.log(`Processing ${testUsers.length} test users...`);

      for (const user of testUsers) {
        this.logger.log(`Checking user ${user.username}...`);
        const existingUser = await this.userModel.findOne({
          $or: [{ email: user.email }, { username: user.username }],
        });

        if (!existingUser) {
          this.logger.log(`Creating new user ${user.username}...`);
          const hashedPassword = await bcrypt.hash(user.password, 10);
          const newUser = await this.userModel.create({
            ...user,
            password: hashedPassword,
          });
          createdUserIds.push(newUser.id);
          this.logger.log(`Created user ${user.username} with ${user.currency} currency`);
          createdCount++;
        } else {
          createdUserIds.push(existingUser.id);
          this.logger.log(`User ${user.username} already exists with ${existingUser.currency} currency`);
          existingCount++;
        }
      }

      // Create some initial streaks between users
      if (createdUserIds.length >= 2) {
        this.logger.log('Creating initial streaks between users...');
        
        // Create a party with all users (5 interactions)
        await this.userInteractionService.recordPartyInteraction(createdUserIds);
        
        // Create some smaller group interactions
        // Rodrigo and Mikel have been in 3 parties together
        for (let i = 0; i < 2; i++) {
          await this.userInteractionService.recordPartyInteraction([createdUserIds[0], createdUserIds[1]]);
        }
        
        // Evelyn and Francisco have been in 4 parties together
        for (let i = 0; i < 3; i++) {
          await this.userInteractionService.recordPartyInteraction([createdUserIds[2], createdUserIds[3]]);
        }
        
        // Angel has been in 2 parties with Rodrigo
        for (let i = 0; i < 1; i++) {
          await this.userInteractionService.recordPartyInteraction([createdUserIds[0], createdUserIds[4]]);
        }
        
        this.logger.log('Initial streaks created successfully');
      }

      this.logger.log(`Seed summary: ${createdCount} users created, ${existingCount} users already existed`);
    } catch (error) {
      this.logger.error('Error in seedUsers:', error);
      throw error;
    }
  }
} 