/* eslint-disable prettier/prettier */

import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/JwtAuthGuard/jwt_auth.guard';
import { Public } from 'src/JwtAuthGuard/public.decorator';

import { AuthService } from '../service/auth.service';

import { googleLoginDto } from '../dto/google_login.dto';

@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Google Login / Signup
  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() data: googleLoginDto) {
    return await this.authService.googleLogin(data);
  }
}
