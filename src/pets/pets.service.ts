import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pet, PetDocument } from '../schemas/pet.schema';

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  constructor(
    @InjectModel(Pet.name) private userModel: Model<PetDocument>,
  ) {}

  async getPet(userId: number): Promise<PetDocument> {
    this.logger.log(`Finding pet with user ID: ${userId}`);
    const pet = await this.userModel.findOne({ userId });
    if (!pet) {
      this.logger.warn(`Pet with user ID ${userId} not found`);
      throw new NotFoundException(`Pet with user ID ${userId} not found`);
    }
    return pet;
  }
} 