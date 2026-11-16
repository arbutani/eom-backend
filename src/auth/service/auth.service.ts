/* eslint-disable prettier/prettier */

import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';

import { OAuth2Client } from 'google-auth-library';

import { createHash, randomBytes } from 'crypto';

import { Users } from '../../users/entity/users.entity';
import { RefreshTokens } from '../../refresh_tokens/entity/refresh_tokens.entity';

import { googleLoginDto } from '../dto/google_login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(Users)
    private usersModel: typeof Users,

    @InjectModel(RefreshTokens)
    private refreshTokensModel: typeof RefreshTokens,

    private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // Google Login / Signup
  async googleLogin(data: googleLoginDto) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;

      if (!clientId) {
        this.logger.error('Google Client ID is not configured');
        throw new InternalServerErrorException(
          'Google Client ID is not configured',
        );
      }

      // Verify Google ID Token
      this.logger.log('Google token verification started');
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.credential,
        audience: clientId,
      });

      const payload = ticket.getPayload();

      if (
        !payload ||
        !payload.sub ||
        !payload.email ||
        payload.email_verified !== true
      ) {
        this.logger.warn('Google token verification failed: Invalid account information');
        throw new UnauthorizedException('Invalid Google account information');
      }

      this.logger.log(`Google token verification succeeded for email: ${payload.email}`);

      const googleId = payload.sub;
      const email = payload.email.toLowerCase();

      const name = payload.name || email.split('@')[0];

      // Find user by Google ID
      let user = await this.usersModel.findOne({
        where: {
          google_id: googleId,
        },
      });

      // If user does not exist, check email
      if (!user) {
        const existingEmail = await this.usersModel.findOne({
          where: {
            email,
          },
        });

        // Do not automatically link a different Google account
        if (existingEmail) {
          this.logger.warn(`User creation failed: Email already registered with another Google account - ${email}`);
          throw new ConflictException(
            'This email is already registered with another Google account',
          );
        }

        // Create new user
        user = await this.usersModel.create({
          name,
          email,
          google_id: googleId,
          role: 'user',
          is_active: true,
        } as any);
        this.logger.log(`New user created - ID: ${user.id}, Email: ${user.email}`);
      } else {
        this.logger.log(`Existing user found - ID: ${user.id}, Email: ${user.email}`);
      }

      // Check account status
      if (!user.is_active) {
        this.logger.warn(`Authentication failed: Account deactivated - ID: ${user.id}, Email: ${user.email}`);
        throw new ForbiddenException('Your account has been deactivated');
      }

      // Generate Access Token
      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      // Generate Refresh Token
      const refreshToken = randomBytes(64).toString('hex');

      // Hash Refresh Token
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

      // Refresh Token Expiry: 7 Days
      const expiresAt = new Date();

      expiresAt.setDate(expiresAt.getDate() + 7);

      // Save Refresh Token Hash
      await this.refreshTokensModel.create({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        is_revoked: false,
      } as any);
      this.logger.log(`Refresh token created and stored for user ID: ${user.id}`);

      return {
        message: 'Google authentication successful',

        access_token: accessToken,

        refresh_token: refreshToken,

        token_type: 'Bearer',

        expires_in: 900,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error(`Google authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
