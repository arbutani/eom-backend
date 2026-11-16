/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  ForbiddenException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorMessageService } from '../../shared/services/errormessage.service';
import { SuccessResponseDto } from '../../shared/dto/successResponse.dto';
import { UsersService } from '../service/users.service';
import { usersRequestDto } from '../dto/usersRequest.dto';
import { UpdateProfileDto } from '../dto/updateProfile.dto';
import { JwtAuthGuard } from 'src/JwtAuthGuard/jwt_auth.guard';
import { Public } from 'src/JwtAuthGuard/public.decorator';
import { CurrentUser } from 'src/JwtAuthGuard/current-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/guards/roles.decorator';
import { usersRole } from '../../enum/users/usersType.enum';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser('sub') userId: string): Promise<SuccessResponseDto> {
    try {
      const data = await this.usersService.getUser(userId);
      return this.errorMessageService.success(
        data,
        true,
        'Current user retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Patch('me')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() requestDto: UpdateProfileDto,
  ): Promise<SuccessResponseDto> {
    try {
      const data = await this.usersService.updateProfile(userId, requestDto);
      return this.errorMessageService.success(
        data,
        true,
        'Profile updated successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(usersRole.ADMIN)
  async createUser(
    @Body() requestDto: usersRequestDto,
    @CurrentUser() user: { role: string },
  ): Promise<SuccessResponseDto> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.usersService.createUser(requestDto);
      return this.errorMessageService.success(
        data,
        true,
        'User created successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() requestDto: usersRequestDto,
    @CurrentUser() user: { sub: string; role: string },
  ): Promise<SuccessResponseDto> {
    const isAdmin = user.role === usersRole.ADMIN;
    const isOwnRecord = user.sub === id;

    if (!isAdmin && !isOwnRecord) {
      throw new ForbiddenException('You can only update your own record');
    }

    try {
      const data = await this.usersService.updateUser(id, requestDto, isAdmin);
      return this.errorMessageService.success(
        data,
        true,
        'User updated successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: string },
  ): Promise<SuccessResponseDto> {
    const isAdmin = user.role === usersRole.ADMIN;
    const isOwnRecord = user.sub === id;

    if (!isAdmin && !isOwnRecord) {
      throw new ForbiddenException('You can only view your own record');
    }

    try {
      const data = await this.usersService.getUser(id);
      return this.errorMessageService.success(
        data,
        true,
        'User retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(usersRole.ADMIN)
  async getAllUsers(@CurrentUser() user: { role: string }): Promise<any> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.usersService.getAllUsers();
      return this.errorMessageService.success(
        data,
        true,
        'Users retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(usersRole.ADMIN)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: { role: string },
  ): Promise<SuccessResponseDto> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.usersService.deleteUser(id);
      return this.errorMessageService.success(
        data,
        true,
        'User deleted successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }
}
