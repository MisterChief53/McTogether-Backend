import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pet, PetDocument } from '../schemas/pet.schema';

@Injectable()
export class PetsService {
    private readonly logger = new Logger(PetsService.name);

    constructor(
        @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    ) {}

    async findOne(userId: string): Promise<PetDocument> {
        this.logger.log(`Finding pet with user ID: ${userId}`);
        const pet = await this.petModel.findOne({ userId });
        if (!pet) {
            this.logger.warn(`Pet with user ID ${userId} not found`);
            throw new NotFoundException(`Pet with user ID ${userId} not found`);
        }
        return pet;
    }

    async create(userId: string): Promise<PetDocument> {
        this.logger.log(`Creating pet for user ID: ${userId}`);
        const existingPet = await this.petModel.findOne({ userId });
        if (existingPet) {
            this.logger.warn(`Pet for user ID ${userId} already exists`);
            throw new NotFoundException(`Pet for user ID ${userId} already exists`);
        }
        const newPet = new this.petModel({ userId });
        return newPet.save();
    }

    async update(pet: Pet): Promise<PetDocument> {
        this.logger.log(`Updating pet with user ID: ${pet.userId}`);
        const updatedPet = await this.petModel.findOneAndUpdate(
            { userId: pet.userId },
            pet,
            { new: true },
        );
        if (!updatedPet) {
            this.logger.warn(`Pet with user ID ${pet.userId} not found`);
            throw new NotFoundException(`Pet with user ID ${pet.userId} not found`);
        }
        return updatedPet;
    }
} 