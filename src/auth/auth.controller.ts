import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(email, username, password);
  }

  @Post('login')
  async login(
    @Body('identifier') identifier: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(identifier, password);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    return this.authService.validateUser(req.user._id);
  }
} 