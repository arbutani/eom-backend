/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { ProductsService } from '../service/products.service';

@Module({
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
