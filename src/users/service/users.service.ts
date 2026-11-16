/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ErrorMessageService } from '../../shared/services/errormessage.service';
import { Op } from 'sequelize';
import { Users } from '../entity/users.entity';
import { usersRequestDto } from '../dto/usersRequest.dto';
import { usersDto } from '../dto/users.dto';
import { UpdateProfileDto } from '../dto/updateProfile.dto';
import { usersRole } from '../../enum/users/usersType.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: typeof Users,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async createUser(requestDto: usersRequestDto) {
    try {
      this.logger.log(`Creating user with email: ${requestDto.email}`);
      const findUser = await this.userRepository.findOne({
        where: {
          email: requestDto.email,
        },
      });
      if (findUser) {
        this.logger.warn(`User creation failed: Email already exists - ${requestDto.email}`);
        throw this.errorMessageService.GeneralErrorCore(
          'User with this email already exists',
          200,
        );
      }

      const fields = {
        name: requestDto.name,
        email: requestDto.email,
        google_id: requestDto.google_id,
        role: requestDto.role,
        is_active: requestDto.is_active,
        phone: requestDto.phone,
        address_line: requestDto.address_line,
        landmark: requestDto.landmark,
        city: requestDto.city,
        state: requestDto.state,
        pincode: requestDto.pincode,
        latitude: requestDto.latitude,
        longitude: requestDto.longitude,
      } as any;

      const user = await this.userRepository.create(fields);
      if (user) {
        this.logger.log(`User created - ID: ${user.id}, Email: ${user.email}`);
        return new usersDto(user);
      } else {
        this.logger.error(`Failed to create user with email: ${requestDto.email}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to create User',
          200,
        );
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 200 && err.message?.includes('already exists')) {
        throw error;
      }
      this.logger.error(`Error creating user: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async updateUser(id: string, requestDto: usersRequestDto, isAdmin = false) {
    try {
      this.logger.log(`Updating user - ID: ${id}`);
      const oldUser = await this.userRepository.findByPk(id);

      if (!oldUser) {
        this.logger.warn(`User update failed: User not found - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'User not found',
          404,
        );
      }

      const findUser = await this.userRepository.findOne({
        where: {
          email: requestDto.email,
          id: { [Op.ne]: id },
        },
      });
      if (findUser) {
        this.logger.warn(`User update failed: Email already exists - ${requestDto.email}`);
        throw this.errorMessageService.GeneralErrorCore(
          'User with this email already exists',
          200,
        );
      }

      const fields = {
        name: requestDto.name,
        email: requestDto.email,
        google_id: requestDto.google_id,
        is_active: requestDto.is_active,
        phone: requestDto.phone,
        address_line: requestDto.address_line,
        landmark: requestDto.landmark,
        city: requestDto.city,
        state: requestDto.state,
        pincode: requestDto.pincode,
        latitude: requestDto.latitude,
        longitude: requestDto.longitude,
      } as any;

      if (isAdmin && requestDto.role && Object.values(usersRole).includes(requestDto.role as usersRole)) {
        fields['role'] = requestDto.role;
      }

      const user = await this.userRepository.update(fields, {
        where: { id },
        returning: true,
      });

      if (user && user.length > 1) {
        this.logger.log(`User updated - ID: ${id}`);
        return new usersDto(user[1][0]);
      } else {
        this.logger.error(`Failed to update user - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to update User',
          200,
        );
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 200 && err.message?.includes('already exists')) {
        throw error;
      }
      if (err.status === 404) {
        throw error;
      }
      this.logger.error(`Error updating user - ID: ${id}: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getUser(id: string) {
    try {
      this.logger.debug(`Fetching user - ID: ${id}`);
      const user = await this.userRepository.findByPk(id);
      if (!user) {
        this.logger.warn(`User not found - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'User not found',
          404,
        );
      }
      return new usersDto(user);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 404) {
        throw error;
      }
      this.logger.error(`Error fetching user - ID: ${id}: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getAllUsers() {
    try {
      this.logger.debug('Fetching all users');
      const users = await this.userRepository.findAll();
      if (!users || users.length === 0) {
        this.logger.warn('No users found');
        throw this.errorMessageService.GeneralErrorCore(
          'No User found',
          404,
        );
      }
      return users.map((user) => new usersDto(user));
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 404) {
        throw error;
      }
      this.logger.error(`Error fetching all users: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async deleteUser(id: string) {
    try {
      this.logger.log(`Deleting user - ID: ${id}`);
      const user = await this.userRepository.findByPk(id);
      if (!user) {
        this.logger.warn(`User deletion failed: User not found - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'User not found',
          404,
        );
      }

      const deleted = await this.userRepository.destroy({
        where: { id: id },
      });

      if (deleted) {
        this.logger.log(`User deleted - ID: ${id}`);
        return { message: 'User deleted successfully' };
      } else {
        this.logger.error(`Failed to delete user - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to delete User',
          200,
        );
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 404) {
        throw error;
      }
      this.logger.error(`Error deleting user - ID: ${id}: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async updateProfile(id: string, requestDto: UpdateProfileDto) {
    try {
      this.logger.log(`Updating profile - ID: ${id}`);
      const oldUser = await this.userRepository.findByPk(id);

      if (!oldUser) {
        this.logger.warn(`Profile update failed: User not found - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'User not found',
          404,
        );
      }

      const fields = {
        name: requestDto.name,
        phone: requestDto.phone,
        address_line: requestDto.address_line,
        landmark: requestDto.landmark,
        city: requestDto.city,
        state: requestDto.state,
        pincode: requestDto.pincode,
        latitude: requestDto.latitude,
        longitude: requestDto.longitude,
      } as any;

      // Remove undefined fields to avoid overwriting with null
      Object.keys(fields).forEach((key) => {
        if (fields[key] === undefined) {
          delete fields[key];
        }
      });

      const user = await this.userRepository.update(fields, {
        where: { id },
        returning: true,
      });

      if (user && user.length > 1) {
        this.logger.log(`Profile updated - ID: ${id}`);
        return new usersDto(user[1][0]);
      } else {
        this.logger.error(`Failed to update profile - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to update profile',
          200,
        );
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 200 && err.message?.includes('already')) {
        throw error;
      }
      if (err.status === 404) {
        throw error;
      }
      this.logger.error(`Error updating profile - ID: ${id}: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }
}
