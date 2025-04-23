import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly PetsService: PetsService) {}

  @Get(':userId')
  async getPet(@Param('userId') userId: string) {
    return this.PetsService.getPet(Number(userId));
  }
} 