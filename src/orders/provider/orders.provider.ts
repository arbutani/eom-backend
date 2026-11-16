/* eslint-disable prettier/prettier */

import { Orders } from '../entity/orders.entity';
import { OrderItems } from '../entity/order_items.entity';

export const OrdersProvider = [
  {
    provide: 'ORDERS_REPOSITORY',
    useValue: Orders,
  },
  {
    provide: 'ORDER_ITEMS_REPOSITORY',
    useValue: OrderItems,
  },
];
