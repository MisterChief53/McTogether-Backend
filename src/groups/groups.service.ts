import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from '../schemas/group.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: number, name?: string): Promise<GroupDocument> {
    this.logger.log(`Creating new group. Leader: ${userId}, Name: ${name || 'unnamed'}`);
    const user = await this.usersService.findOne(userId);
    if (user.groupId) {
      this.logger.warn(`User ${userId} attempted to create group while already in one`);
      throw new BadRequestException('User is already in a group');
    }

    const group = await this.groupModel.create({
      leaderId: userId,
      members: [userId],
      name,
    });

    await this.usersService.updateGroup(userId, group.id, 'leader');
    this.logger.log(`Created new group ${group.id} with leader ${userId}`);
    return group;
  }

  async findOne(groupId: string): Promise<GroupDocument> {
    this.logger.log(`Finding group with ID: ${groupId}`);
    const group = await this.groupModel.findById(groupId);
    if (!group) {
      this.logger.warn(`Group with ID ${groupId} not found`);
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }
    return group;
  }

  async join(groupId: string, userId: number): Promise<GroupDocument> {
    this.logger.log(`User ${userId} attempting to join group ${groupId}`);
    const [group, user] = await Promise.all([
      this.findOne(groupId),
      this.usersService.findOne(userId),
    ]);

    if (user.groupId) {
      this.logger.warn(`User ${userId} attempted to join group while already in one`);
      throw new BadRequestException('User is already in a group');
    }

    if (group.status !== 'active') {
      this.logger.warn(`User ${userId} attempted to join inactive group ${groupId}`);
      throw new BadRequestException('Group is not active');
    }

    group.members.push(userId);
    await group.save();
    await this.usersService.updateGroup(userId, groupId, 'member');
    this.logger.log(`User ${userId} joined group ${groupId}`);
    return group;
  }

  async leave(groupId: string, userId: number): Promise<void> {
    this.logger.log(`User ${userId} attempting to leave group ${groupId}`);
    const [group, user] = await Promise.all([
      this.findOne(groupId),
      this.usersService.findOne(userId),
    ]);

    if (!user.groupId || user.groupId !== groupId) {
      this.logger.warn(`User ${userId} attempted to leave group they're not in`);
      throw new BadRequestException('User is not in this group');
    }

    if (user.role === 'leader') {
      this.logger.log(`Leader ${userId} leaving group ${groupId}, disbanding group`);
      group.status = 'disbanded';
      await group.save();
      await Promise.all(
        group.members.map((memberId) =>
          this.usersService.leaveGroup(memberId),
        ),
      );
      this.logger.log(`Group ${groupId} disbanded by leader ${userId}`);
    } else {
      group.members = group.members.filter((id) => id !== userId);
      await group.save();
      await this.usersService.leaveGroup(userId);
      this.logger.log(`User ${userId} left group ${groupId}`);
    }
  }
} 