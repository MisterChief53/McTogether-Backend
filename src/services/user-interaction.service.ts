import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInteraction } from '../schemas/user-interaction.schema';

@Injectable()
export class UserInteractionService {
  private readonly logger = new Logger(UserInteractionService.name);

  constructor(
    @InjectModel(UserInteraction.name)
    private userInteractionModel: Model<UserInteraction>,
  ) {}

  async recordPartyInteraction(userIds: string[]): Promise<void> {
    try {
      // Create all possible pairs of users in the party
      for (let i = 0; i < userIds.length; i++) {
        for (let j = i + 1; j < userIds.length; j++) {
          const user1 = userIds[i];
          const user2 = userIds[j];
          
          // Ensure consistent ordering of user IDs to avoid duplicate pairs
          const [smallerId, largerId] = [user1, user2].sort();
          
          await this.userInteractionModel.findOneAndUpdate(
            { user1: smallerId, user2: largerId },
            {
              $inc: { interactionCount: 1 },
              $set: { lastInteraction: new Date() }
            },
            { upsert: true, new: true }
          );
        }
      }
    } catch (error) {
      this.logger.error('Error recording party interaction:', error);
      throw error;
    }
  }

  async getUserStreaks(userId: string): Promise<UserInteraction[]> {
    try {
      return await this.userInteractionModel
        .find({
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        })
        .populate('user1 user2', 'username')
        .sort({ interactionCount: -1 });
    } catch (error) {
      this.logger.error('Error getting user streaks:', error);
      throw error;
    }
  }

  async getTopStreaks(limit: number = 10): Promise<UserInteraction[]> {
    try {
      return await this.userInteractionModel
        .find()
        .populate('user1 user2', 'username')
        .sort({ interactionCount: -1 })
        .limit(limit);
    } catch (error) {
      this.logger.error('Error getting top streaks:', error);
      throw error;
    }
  }
} 