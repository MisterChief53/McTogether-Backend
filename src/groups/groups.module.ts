import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from '../schemas/group.schema';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { UsersService } from '../users/users.service';
import { UserInteractionService } from '../services/user-interaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService, UsersService, UserInteractionService],
  exports: [GroupsService],
})
export class GroupsModule {} 