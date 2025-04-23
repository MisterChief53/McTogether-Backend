import { Body, Controller, Delete, Get, Patch, Param, Post, UseGuards, Logger, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('groups')
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name);
  constructor(private readonly groupsService: GroupsService) {}

  @Get(':groupId')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Param('groupId') groupId: string
  ) {
    return this.groupsService.findOne(groupId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: any
  ) {
    return this.groupsService.create(req.user.id);
  }

  @Patch(':groupId/join')
  @UseGuards(AuthGuard('jwt'))
  async join(
    @Param('groupId') groupId: string,
    @Req() req: any,
  ) {
    return this.groupsService.join(groupId, req.user.id);
  }

  @Patch(':groupId/leave')
  @UseGuards(AuthGuard('jwt'))
  async leave(
    @Param('groupId') groupId: string,
    @Req() req: any,
  ) {
    return this.groupsService.leave(groupId, req.user.id);
  }
} 