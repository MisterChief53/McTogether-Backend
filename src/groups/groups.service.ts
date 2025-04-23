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

  async findOne(groupId: string): Promise<GroupDocument> {
    this.logger.log(`Finding group with ID: ${groupId}`);
    const group = await this.groupModel.findById(groupId);
    if (!group) {
      this.logger.warn(`Group with ID ${groupId} not found`);
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }
    return group;
  }

  async create(userId: string): Promise<GroupDocument> {
    this.logger.log(`[Create Group] Starting group creation for user ${userId}`);
    const user = await this.usersService.findOne(userId);
    this.logger.log(`[Create Group] Found user: ${JSON.stringify(user)}`);
    
    if (user.groupId) {
      this.logger.warn(`[Create Group] User ${userId} attempted to create group while already in group ${user.groupId}`);
      throw new BadRequestException('User is already in a group');
    }

    this.logger.log(`[Create Group] Creating new group with user ${userId} as first member`);
    const group = await this.groupModel.create({
      members: [userId],
      createdAt: new Date(),
    });
    this.logger.log(`[Create Group] Group created successfully with ID: ${group.id}`);

    this.logger.log(`[Create Group] Updating user ${userId} to be in group ${group.id}`);
    await this.usersService.updateGroup(userId, group.id);
    this.logger.log(`[Create Group] User group updated successfully`);

    return group;
  }

  async join(groupId: string, userId: string): Promise<GroupDocument> {
    this.logger.log(`User ${userId} attempting to join group ${groupId}`);
    const [group, user] = await Promise.all([
      this.findOne(groupId),
      this.usersService.findOne(userId),
    ]);

    if (user.groupId) {
      this.logger.warn(`User ${userId} attempted to join group while already in one`);
      throw new BadRequestException('User is already in a group');
    }

    if (!group) {
      this.logger.warn(`Group with ID ${groupId} not found`);
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    group.members.push(userId);

    await group.save();
    await this.usersService.updateGroup(userId, groupId);

    this.logger.log(`User ${userId} joined group ${groupId}`);
    return group;
  }

  async leave(groupId: string, userId: string): Promise<void> {
    this.logger.log(`User ${userId} attempting to leave group ${groupId}`);
    const [group, user] = await Promise.all([
      this.findOne(groupId),
      this.usersService.findOne(userId),
    ]);

    if (!group) {
      this.logger.warn(`Group with ID ${groupId} not found`);
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!group.members.includes(userId)) {
      this.logger.warn(`User ${userId} attempted to leave group they're not in`);
      throw new BadRequestException('User is not in this group');
    }

    this.usersService.updateGroup(userId, null);
    group.members = group.members.filter((id) => id !== userId);
    await group.save();
    this.logger.log(`User ${userId} left group ${groupId}`);

    if (group.members.length === 0) {
      await this.groupModel.deleteOne({ _id: groupId });
      this.logger.log(`Group ${groupId} deleted as it has no members`); 
    }
  }
} 