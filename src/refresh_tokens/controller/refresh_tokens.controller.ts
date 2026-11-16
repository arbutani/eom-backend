/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ErrorMessageService } from '../../shared/services/errormessage.service';
import { SuccessResponseDto } from '../../shared/dto/successResponse.dto';
import { RefreshTokensService } from '../service/refresh_tokens.service';
import { refreshTokensRequestDto } from '../dto/refresh_tokensRequest.dto';
import { JwtAuthGuard } from 'src/JwtAuthGuard/jwt_auth.guard';
import { CurrentUser } from 'src/JwtAuthGuard/current-user.decorator';
import { usersRole } from '../../enum/users/usersType.enum';

@UseGuards(JwtAuthGuard)
@Controller('refresh_tokens')
export class RefreshTokensController {
  constructor(
    private readonly refreshTokensService: RefreshTokensService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  @Post()
  async createRefreshToken(
    @Body() requestDto: refreshTokensRequestDto,
    @CurrentUser() user: { role: string },
  ): Promise<SuccessResponseDto> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.refreshTokensService.createRefreshToken(
        requestDto,
      );
      return this.errorMessageService.success(
        data,
        true,
        'Refresh token created successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Put(':id')
  async updateRefreshToken(
    @Param('id') id: string,
    @Body() requestDto: refreshTokensRequestDto,
    @CurrentUser() user: { role: string },
  ): Promise<SuccessResponseDto> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.refreshTokensService.updateRefreshToken(
        id,
        requestDto,
      );
      return this.errorMessageService.success(
        data,
        true,
        'Refresh token updated successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Get(':id')
  async getRefreshToken(
    @Param('id') id: string,
    @CurrentUser() user: { role: string },
  ): Promise<SuccessResponseDto> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.refreshTokensService.getRefreshToken(id);
      return this.errorMessageService.success(
        data,
        true,
        'Refresh token retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Get()
  async getAllRefreshTokens(
    @CurrentUser() user: { role: string },
  ): Promise<any> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.refreshTokensService.getAllRefreshTokens();
      return this.errorMessageService.success(
        data,
        true,
        'Refresh tokens retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Delete(':id')
  async deleteRefreshToken(
    @Param('id') id: string,
    @CurrentUser() user: { role: string },
  ): Promise<SuccessResponseDto> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.refreshTokensService.deleteRefreshToken(id);
      return this.errorMessageService.success(
        data,
        true,
        'Refresh token deleted successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }
}
