import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly groupsService: GroupsService,
  ) {}

  async register(email: string, username: string, password: string) {
    // Check if email or username already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      this.logger.warn(`Registration attempt with existing email or username`);
      throw new BadRequestException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      email,
      username,
      password: hashedPassword,
      currency: 0,
    });

    // Generate JWT
    const token = this.jwtService.sign({ sub: user._id });

    this.logger.log(`New user registered: ${email}`);
    return {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        currency: user.currency,
      },
      token,
    };
  }

  async login(identifier: string, password: string) {
    // Try to find user by email or username
    const user = await this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      this.logger.warn(`Login attempt with non-existent identifier: ${identifier}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login attempt with invalid password for user: ${identifier}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // If user is in a group, make them leave it
    if (user.groupId) {
      try {
        await this.groupsService.leave(user.groupId, user.id);
        this.logger.log(`User ${user.id} left group ${user.groupId} during login`);
      } catch (error) {
        this.logger.error(`Failed to leave group during login: ${error.message}`);
        // Continue with login even if leaving group fails
      }
    }

    const token = this.jwtService.sign({ sub: user.id });

    this.logger.log(`User logged in: ${user.email}`);
    return {
      user: {
        _id: user.id,
        email: user.email,
        username: user.username,
        currency: user.currency,
        groupId: user.groupId,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    return this.userModel.findById(userId);
  }
} 