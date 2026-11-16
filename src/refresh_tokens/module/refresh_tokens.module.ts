/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/module/auth.module';
import { RefreshTokensController } from '../controller/refresh_tokens.controller';
import { RefreshTokensService } from '../service/refresh_tokens.service';
import { RefreshTokensProvider } from '../provider/refresh_tokens.provider';

@Module({
  imports: [AuthModule],
  controllers: [RefreshTokensController],
  providers: [...RefreshTokensProvider, RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
