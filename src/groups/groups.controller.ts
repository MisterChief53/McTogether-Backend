import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: any,
    @Body('name') name?: string,
  ) {
    return this.groupsService.create(req.user._id, name);
  }

  @Get(':groupId')
  async findOne(@Param('groupId') groupId: string) {
    return this.groupsService.findOne(groupId);
  }

  @Post(':groupId/join')
  @UseGuards(AuthGuard('jwt'))
  async join(
    @Param('groupId') groupId: string,
    @Req() req: any,
  ) {
    return this.groupsService.join(groupId, req.user._id);
  }

  @Delete(':groupId')
  @UseGuards(AuthGuard('jwt'))
  async leave(
    @Param('groupId') groupId: string,
    @Req() req: any,
  ) {
    return this.groupsService.leave(groupId, req.user._id);
  }
} 