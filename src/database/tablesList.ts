/* eslint-disable prettier/prettier */

import { RefreshTokens } from '../refresh_tokens/entity/refresh_tokens.entity';
import { Users } from '../users/entity/users.entity';
import { Orders } from '../orders/entity/orders.entity';
import { OrderItems } from '../orders/entity/order_items.entity';

export const TableList = [Users, RefreshTokens, Orders, OrderItems];
