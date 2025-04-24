import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User, UserSchema } from './schemas/user.schema';
import { Group, GroupSchema } from './schemas/group.schema';
import { Pet, PetSchema } from './schemas/pet.schema';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { UserInteraction, UserInteractionSchema } from './schemas/user-interaction.schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { SeedService } from './seed/seed.service';
import { AuthModule } from './auth/auth.module';
import { UserInteractionService } from './services/user-interaction.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Pet.name, schema: PetSchema },
      { name: Menu.name, schema: MenuSchema },
      { name: UserInteraction.name, schema: UserInteractionSchema },
    ]),
    AuthModule,
  ],
  controllers: [AppController, UsersController, GroupsController, PaymentsController],
  providers: [
    AppService, 
    UsersService, 
    GroupsService, 
    SeedService, 
    PaymentsService,
    UserInteractionService,
  ],
})
export class AppModule {}
