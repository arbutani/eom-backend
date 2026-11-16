/* eslint-disable prettier/prettier */

import { IsNotEmpty, IsString, IsBoolean, IsDateString } from 'class-validator';

export class refreshTokensRequestDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  user_id: string;

  @IsNotEmpty({ message: 'Token hash is required' })
  @IsString({ message: 'Token hash must be a string' })
  token_hash: string;

  @IsNotEmpty({ message: 'Expiry date is required' })
  @IsDateString({}, { message: 'Expiry date must be a valid date' })
  expires_at: string;

  @IsNotEmpty({ message: 'Revoked status is required' })
  @IsBoolean({ message: 'Revoked status must be a boolean' })
  is_revoked: boolean;
}
