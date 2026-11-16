/* eslint-disable prettier/prettier */

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, MaxLength, MinLength, Matches, IsNumber, Min, Max } from 'class-validator';

export class usersRequestDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @IsNotEmpty({ message: 'Google ID is required' })
  @IsString({ message: 'Google ID must be a string' })
  google_id: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsString({ message: 'Role must be a string' })
  role: 'admin' | 'user' | 'worker';

  @IsNotEmpty({ message: 'Active status is required' })
  is_active: boolean;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+91${digits.slice(2)}`;
    return value;
  })
  @Matches(/^\+91[6-9]\d{9}$/, { message: 'Phone must be a valid 10-digit Indian mobile number in +91XXXXXXXXXX format' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Address line must be a string' })
  @MaxLength(255, { message: 'Address line must not exceed 255 characters' })
  address_line?: string;

  @IsOptional()
  @IsString({ message: 'Landmark must be a string' })
  @MaxLength(255, { message: 'Landmark must not exceed 255 characters' })
  landmark?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @MaxLength(100, { message: 'State must not exceed 100 characters' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'Pincode must be a string' })
  @Matches(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits' })
  pincode?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be >= -90' })
  @Max(90, { message: 'Latitude must be <= 90' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be >= -180' })
  @Max(180, { message: 'Longitude must be <= 180' })
  longitude?: number;
}
