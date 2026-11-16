/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/module/auth.module';
import { ProductsModule } from '../../products/module/products.module';
import { UsersProvider } from '../../users/provider/users.provider';
import { OrdersController } from '../controller/orders.controller';
import { OrdersProvider } from '../provider/orders.provider';
import { OrdersService } from '../service/orders.service';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [OrdersController],
  providers: [...OrdersProvider, ...UsersProvider, OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
