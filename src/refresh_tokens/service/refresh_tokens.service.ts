/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ErrorMessageService } from '../../shared/services/errormessage.service';
import { Op } from 'sequelize';
import { RefreshTokens } from '../entity/refresh_tokens.entity';
import { refreshTokensRequestDto } from '../dto/refresh_tokensRequest.dto';
import { refreshTokensDto } from '../dto/refresh_tokens.dto';

@Injectable()
export class RefreshTokensService {
  private readonly logger = new Logger(RefreshTokensService.name);

  constructor(
    @Inject('REFRESH_TOKENS_REPOSITORY')
    private readonly refreshTokenRepository: typeof RefreshTokens,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  async createRefreshToken(requestDto: refreshTokensRequestDto) {
    try {
      this.logger.log(`Creating refresh token for user - ID: ${requestDto.user_id}`);
      const findRefreshToken =
        await this.refreshTokenRepository.findOne({
          where: {
            token_hash: requestDto.token_hash,
          },
        });
      if (findRefreshToken) {
        this.logger.warn(`Refresh token creation failed: Token hash already exists for user - ID: ${requestDto.user_id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Refresh token with this token hash already exists',
          200,
        );
      }

      const fields = {
        user_id: requestDto.user_id,
        token_hash: requestDto.token_hash,
        expires_at: requestDto.expires_at,
        is_revoked: requestDto.is_revoked,
      } as any;

      const refreshToken =
        await this.refreshTokenRepository.create(fields);
      if (refreshToken) {
        this.logger.log(`Refresh token created - ID: ${refreshToken.id}, User ID: ${requestDto.user_id}`);
        return new refreshTokensDto(refreshToken);
      } else {
        this.logger.error(`Failed to create refresh token for user - ID: ${requestDto.user_id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to create Refresh token',
          200,
        );
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 200 && err.message?.includes('already exists')) {
        throw error;
      }
      this.logger.error(`Error creating refresh token for user - ID: ${requestDto.user_id}: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async updateRefreshToken(
    id: string,
    requestDto: refreshTokensRequestDto,
  ) {
    try {
      this.logger.log(`Updating refresh token - ID: ${id}`);
      const oldRefreshToken =
        await this.refreshTokenRepository.findByPk(id);

      if (!oldRefreshToken) {
        this.logger.warn(`Refresh token update failed: Not found - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Refresh token not found',
          404,
        );
      }

      const findRefreshToken =
        await this.refreshTokenRepository.findOne({
          where: {
            token_hash: requestDto.token_hash,
            id: { [Op.ne]: id },
          },
        });
      if (findRefreshToken) {
        this.logger.warn(`Refresh token update failed: Token hash already exists - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Refresh token with this token hash already exists',
          200,
        );
      }

      const fields = {
        user_id: requestDto.user_id,
        token_hash: requestDto.token_hash,
        expires_at: requestDto.expires_at,
        is_revoked: requestDto.is_revoked,
      } as any;

      const refreshToken =
        await this.refreshTokenRepository.update(fields, {
          where: { id },
          returning: true,
        });

      if (refreshToken && refreshToken.length > 1) {
        this.logger.log(`Refresh token updated - ID: ${id}`);
        return new refreshTokensDto(refreshToken[1][0]);
      } else {
        this.logger.error(`Failed to update refresh token - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to update Refresh token',
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
      this.logger.error(`Error updating refresh token - ID: ${id}: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getRefreshToken(id: string) {
    try {
      this.logger.debug(`Fetching refresh token - ID: ${id}`);
      const refreshToken =
        await this.refreshTokenRepository.findByPk(id);
      if (!refreshToken) {
        this.logger.warn(`Refresh token not found - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Refresh token not found',
          404,
        );
      }
      return new refreshTokensDto(refreshToken);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 404) {
        throw error;
      }
      this.logger.error(`Error fetching refresh token - ID: ${id}: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getAllRefreshTokens() {
    try {
      this.logger.debug('Fetching all refresh tokens');
      const refreshTokens =
        await this.refreshTokenRepository.findAll();
      if (!refreshTokens || refreshTokens.length === 0) {
        this.logger.warn('No refresh tokens found');
        throw this.errorMessageService.GeneralErrorCore(
          'No Refresh token found',
          404,
        );
      }
      return refreshTokens.map(
        (refreshToken) => new refreshTokensDto(refreshToken),
      );
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 404) {
        throw error;
      }
      this.logger.error(`Error fetching all refresh tokens: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async deleteRefreshToken(id: string) {
    try {
      this.logger.log(`Deleting refresh token - ID: ${id}`);
      const refreshToken =
        await this.refreshTokenRepository.findByPk(id);
      if (!refreshToken) {
        this.logger.warn(`Refresh token deletion failed: Not found - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Refresh token not found',
          404,
        );
      }

      const deleted =
        await this.refreshTokenRepository.destroy({
          where: { id: id },
        });

      if (deleted) {
        this.logger.log(`Refresh token deleted - ID: ${id}`);
        return { message: 'Refresh token deleted successfully' };
      } else {
        this.logger.error(`Failed to delete refresh token - ID: ${id}`);
        throw this.errorMessageService.GeneralErrorCore(
          'Failed to delete Refresh token',
          200,
        );
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 404) {
        throw error;
      }
      this.logger.error(`Error deleting refresh token - ID: ${id}: ${err.message ?? 'Unknown error'}`, err.stack);
      throw this.errorMessageService.CatchHandler(error);
    }
  }
}
