import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(
    @Body('userId') userId: number,
    @Body('name') name?: string,
  ) {
    return this.groupsService.create(userId, name);
  }

  @Get(':groupId')
  async findOne(@Param('groupId') groupId: string) {
    return this.groupsService.findOne(groupId);
  }

  @Post(':groupId/join')
  async join(
    @Param('groupId') groupId: string,
    @Body('userId') userId: number,
  ) {
    return this.groupsService.join(groupId, userId);
  }

  @Delete(':groupId')
  async leave(
    @Param('groupId') groupId: string,
    @Body('userId') userId: number,
  ) {
    return this.groupsService.leave(groupId, userId);
  }
} 