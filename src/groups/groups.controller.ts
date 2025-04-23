import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, Logger } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('groups')
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name);
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Req() req: any,
    @Body('name') name?: string,
  ) {
    this.logger.debug('Create group request details:', {
      user: req.user,
      requestBody: { name },
      headers: req.headers,
    });
    
    if (!req.user || !req.user._id) {
      this.logger.error('User not found in request:', req.user);
      throw new Error('User not found in request');
    }

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
    this.logger.debug('Leave group request details:', {
      groupId,
      user: req.user,
      headers: req.headers,
    });

    if (!req.user || !req.user._id) {
      this.logger.error('User not found in leave request:', req.user);
      throw new Error('User not found in request');
    }

    return this.groupsService.leave(groupId, req.user._id);
  }
} 