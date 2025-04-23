import { Body, Controller, Get, Param, Post, UseGuards, Req, Patch } from '@nestjs/common';
import { PetsService } from './pets.service';
import { AuthGuard } from '@nestjs/passport';
import { Pet } from '../schemas/pet.schema';

@Controller('pets')
export class PetsController {
    constructor(private readonly PetsService: PetsService) {}

    @Get(':userId')
    @UseGuards(AuthGuard('jwt'))
    async findOne(@Param('userId') userId: string) {
        return this.PetsService.findOne(userId);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(
        @Param('userId') userId: string,
    ) {
        return this.PetsService.create(userId);
    }

    @Patch('update')
    @UseGuards(AuthGuard('jwt'))
    async update(
        @Body() pet: Pet,
    ) {
        return this.PetsService.update(pet);
    }
} 