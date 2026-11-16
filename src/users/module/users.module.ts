/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/module/auth.module';
import { UsersController } from '../controller/users.controller';
import { UsersProvider } from '../provider/users.provider';
import { UsersService } from '../service/users.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [...UsersProvider, UsersService],
  exports: [...UsersProvider, UsersService],
})
export class UsersModule {}
