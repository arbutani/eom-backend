/* eslint-disable prettier/prettier */

import { IsNotEmpty, IsString } from 'class-validator';

export class googleLoginDto {
  @IsNotEmpty({ message: 'Google credential is required' })
  @IsString({ message: 'Google credential must be a string' })
  credential: string;
}
