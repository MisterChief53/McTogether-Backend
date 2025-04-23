import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
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

    const token = this.jwtService.sign({ sub: user._id });

    this.logger.log(`User logged in: ${user.email}`);
    return {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        currency: user.currency,
        groupId: null,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    return this.userModel.findById(userId);
  }
} 