/* eslint-disable prettier/prettier */

import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/module/auth.module';
import { DatabaseModule } from './database/module/database.module';
import { OrdersModule } from './orders/module/orders.module';
import { ProductsModule } from './products/module/products.module';
import { RefreshTokensModule } from './refresh_tokens/module/refresh_tokens.module';
import { SharedModule } from './shared/module/shared.module';
import { UsersModule } from './users/module/users.module';
import { HealthModule } from './health/health.module';

export const moduleList = [
  ThrottlerModule.forRoot([
    {
      ttl: 60000,
      limit: 100,
    },
  ]),
  SharedModule,
  UsersModule,
  RefreshTokensModule,
  DatabaseModule,
  AuthModule,
  ProductsModule,
  OrdersModule,
  HealthModule,
];
