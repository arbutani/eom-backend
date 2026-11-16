/* eslint-disable prettier/prettier */

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class orderCancelDto {
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(255, { message: 'Reason must not exceed 255 characters' })
  reason?: string;
}
