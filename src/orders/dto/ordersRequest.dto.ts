/* eslint-disable prettier/prettier */

import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemRequestDto {
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsInt({ message: 'Product ID must be an integer' })
  @Type(() => Number)
  product_id: number;

  @IsOptional()
  @IsString({ message: 'Size must be a string' })
  @MaxLength(50, { message: 'Size must not exceed 50 characters' })
  size?: string;

  @IsNotEmpty({ message: 'Quantity is required' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Type(() => Number)
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(20, { message: 'Quantity must not exceed 20' })
  quantity: number;
}

export class ordersRequestDto {
  @IsNotEmpty({ message: 'Customer name is required' })
  @IsString({ message: 'Customer name must be a string' })
  @MaxLength(255, { message: 'Customer name must not exceed 255 characters' })
  customer_name: string;

  @IsNotEmpty({ message: 'Customer phone is required' })
  @IsString({ message: 'Customer phone must be a string' })
@Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+91${digits.slice(2)}`;
    return value;
  })
  @Matches(/^\+91[6-9]\d{9}$/, {
    message:
      'Customer phone must be a valid 10-digit Indian mobile number in +91XXXXXXXXXX format',
  })
  customer_phone: string;

  @IsNotEmpty({ message: 'Address type is required' })
  @IsString({ message: 'Address type must be a string' })
  @MaxLength(50, { message: 'Address type must not exceed 50 characters' })
  address_type: string;

  @IsNotEmpty({ message: 'Address line is required' })
  @IsString({ message: 'Address line must be a string' })
  @MaxLength(255, { message: 'Address line must not exceed 255 characters' })
  address_line: string;

  @IsOptional()
  @IsString({ message: 'Landmark must be a string' })
  @MaxLength(255, { message: 'Landmark must not exceed 255 characters' })
  landmark?: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city: string;

  @IsNotEmpty({ message: 'State is required' })
  @IsString({ message: 'State must be a string' })
  @MaxLength(100, { message: 'State must not exceed 100 characters' })
  state: string;

  @IsNotEmpty({ message: 'Pincode is required' })
  @IsString({ message: 'Pincode must be a string' })
  @Matches(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits' })
  pincode: string;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Type(() => Number)
  @Min(-90, { message: 'Latitude must be >= -90' })
  @Max(90, { message: 'Latitude must be <= 90' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Type(() => Number)
  @Min(-180, { message: 'Longitude must be >= -180' })
  @Max(180, { message: 'Longitude must be <= 180' })
  longitude?: number;

  @IsNotEmpty({ message: 'Policy accepted is required' })
  @Equals(true, { message: 'Policy must be accepted' })
  policy_accepted: boolean;

  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'At least 1 item is required' })
  @ArrayMaxSize(20, { message: 'A maximum of 20 items is allowed' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequestDto)
  items: OrderItemRequestDto[];
}
