/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';

import { Users } from '../../users/entity/users.entity';
import { RefreshTokens } from '../../refresh_tokens/entity/refresh_tokens.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Users, RefreshTokens]),

    JwtModule.registerAsync({
      useFactory: async () => {
        const secret = process.env.JWT_ACCESS_SECRET;

        if (!secret) {
          throw new Error('JWT_ACCESS_SECRET is not configured');
        }

        return {
          secret,
          signOptions: {
            expiresIn: 900,
          },
        };
      },
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService],

  exports: [AuthService, JwtModule],
})
export class AuthModule {}
