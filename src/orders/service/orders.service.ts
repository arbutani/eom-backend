/* eslint-disable prettier/prettier */
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError } from 'sequelize';
import { ErrorMessageService } from '../../shared/services/errormessage.service';
import { Orders } from '../entity/orders.entity';
import { OrderItems } from '../entity/order_items.entity';
import { ordersRequestDto } from '../dto/ordersRequest.dto';
import { ordersDto } from '../dto/orders.dto';
import { ordersQueryDto } from '../dto/ordersQuery.dto';
import { orderCancelDto } from '../dto/orderCancel.dto';
import { ProductsService } from '../../products/service/products.service';
import { Users } from '../../users/entity/users.entity';
import { ordersStatus } from '../../enum/orders/ordersStatus.enum';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject('ORDERS_REPOSITORY')
    private readonly ordersRepository: typeof Orders,
    @Inject('ORDER_ITEMS_REPOSITORY')
    private readonly orderItemsRepository: typeof OrderItems,
    @Inject('USERS_REPOSITORY')
    private readonly usersRepository: typeof Users,
    private readonly sequelize: Sequelize,
    private readonly errorMessageService: ErrorMessageService,
    private readonly productsService: ProductsService,
  ) {}

  private maskPhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    const last4 = digits.slice(-4);
    return `******${last4}`;
  }

  private formatDateForOrderNumber(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

  private async generateUniqueOrderNumber(
    transaction: any,
    maxRetries = 5,
  ): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const now = new Date();
      const datePart = this.formatDateForOrderNumber(now);

      const lastOrder = await this.ordersRepository.findOne({
        where: this.sequelize.where(
          this.sequelize.fn('DATE', this.sequelize.col('created_at')),
          this.sequelize.fn('DATE', now),
        ) as any,
        order: [['order_number', 'DESC']],
        transaction,
      });

      let seq = 1;
      if (lastOrder?.order_number) {
        const parts = lastOrder.order_number.split('-');
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!Number.isNaN(lastSeq)) {
          seq = lastSeq + 1;
        }
      }
      seq += attempt;

      const candidate = `BC-${datePart}-${String(seq).padStart(4, '0')}`;
      const existing = await this.ordersRepository.findOne({
        where: { order_number: candidate },
        transaction,
      });
      if (!existing) {
        return candidate;
      }
    }
    const now = new Date();
    const datePart = this.formatDateForOrderNumber(now);
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `BC-${datePart}-${rand}`;
  }

  async createOrder(requestDto: ordersRequestDto, userId?: string) {
    const maskedPhone = this.maskPhone(requestDto.customer_phone);
    this.logger.log(
      `Creating order - guest/user: ${userId ? userId : 'guest'}, phone: ${maskedPhone}`,
    );

    try {
      const ids = requestDto.items.map((i) => i.product_id);
      const productMap = this.productsService.getMany(ids);

      let totalAmount = 0;
      const preparedItems = requestDto.items.map((item) => {
        const product = productMap.get(item.product_id)!;
        const unitPrice = Number(product.price);
        const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
        totalAmount = Number((totalAmount + lineTotal).toFixed(2));
        return {
          product_id: product.id,
          product_name: product.name,
          size: item.size ?? null,
          quantity: item.quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
        };
      });

      for (let attempt = 0; attempt < 3; attempt++) {
        const transaction = await this.sequelize.transaction();
        try {
          const orderNumber = await this.generateUniqueOrderNumber(transaction);

          const order = await this.ordersRepository.create(
            {
              order_number: orderNumber,
              user_id: userId ?? null,
              status: ordersStatus.PENDING,
              cancel_reason: null,
              customer_name: requestDto.customer_name,
              customer_phone: requestDto.customer_phone,
              address_type: requestDto.address_type,
              address_line: requestDto.address_line,
              landmark: requestDto.landmark ?? null,
              city: requestDto.city,
              state: requestDto.state,
              pincode: requestDto.pincode,
              latitude: requestDto.latitude ?? null,
              longitude: requestDto.longitude ?? null,
              policy_accepted: requestDto.policy_accepted,
              total_amount: totalAmount,
              confirmed_at: null,
              cancelled_at: null,
            } as any,
            { transaction },
          );

          const itemsToCreate = preparedItems.map((it) => ({
            ...it,
            order_id: order.id,
          }));
          await this.orderItemsRepository.bulkCreate(itemsToCreate as any, {
            transaction,
          });

          if (userId) {
            const user = await this.usersRepository.findByPk(userId, {
              transaction,
            });
            if (user) {
              const updates: any = {};
              if (!user.name) updates.name = requestDto.customer_name;
              if (!user.phone) updates.phone = requestDto.customer_phone;
              if (!user.address_line) updates.address_line = requestDto.address_line;
              if (!user.landmark && requestDto.landmark)
                updates.landmark = requestDto.landmark;
              if (!user.city) updates.city = requestDto.city;
              if (!user.state) updates.state = requestDto.state;
              if (!user.pincode) updates.pincode = requestDto.pincode;
              if (
                (user.latitude === null || user.latitude === undefined) &&
                requestDto.latitude !== undefined
              )
                updates.latitude = requestDto.latitude;
              if (
                (user.longitude === null || user.longitude === undefined) &&
                requestDto.longitude !== undefined
              )
                updates.longitude = requestDto.longitude;

              if (Object.keys(updates).length > 0) {
                await this.usersRepository.update(updates, {
                  where: { id: userId },
                  transaction,
                });
              }
            }
          }

          await transaction.commit();

          const created = await this.ordersRepository.findByPk(order.id, {
            include: [{ model: OrderItems, as: 'items' }],
          });
          this.logger.log(
            `Order created - order_number: ${orderNumber}, user: ${userId ? userId : 'guest'}, phone: ${maskedPhone}`,
          );
          return new ordersDto(created);
        } catch (err) {
          await transaction.rollback();
          if (err instanceof UniqueConstraintError && attempt < 2) {
            this.logger.warn(
              `Order number collision, retrying attempt ${attempt + 1}`,
            );
            continue;
          }
          throw err;
        }
      }

      throw this.errorMessageService.GeneralErrorCore(
        'Failed to create order',
        500,
      );
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 400) {
        throw error;
      }
      this.logger.error(
        `Error creating order: ${err.message ?? 'Unknown error'}`,
        err.stack,
      );
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getMyOrders(userId: string, query: ordersQueryDto) {
    try {
      this.logger.debug(`Fetching my orders - user: ${userId}`);
      const where: any = { user_id: userId };
      if (query.status) {
        where.status = query.status;
      }
      const orders = await this.ordersRepository.findAll({
        where,
        include: [{ model: OrderItems, as: 'items' }],
        order: [['createdAt', 'DESC']],
      });
      return orders.map((o) => new ordersDto(o));
    } catch (error: unknown) {
      const err = error as { message?: string; stack?: string };
      this.logger.error(
        `Error fetching my orders - user: ${userId}: ${err.message ?? 'Unknown error'}`,
        err.stack,
      );
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getAllOrders(query: ordersQueryDto) {
    try {
      this.logger.debug('Fetching all orders (admin)');
      const page = query.page && query.page > 0 ? query.page : 1;
      const limit = query.limit && query.limit > 0 ? query.limit : 10;
      const offset = (page - 1) * limit;
      const where: any = {};
      if (query.status) {
        where.status = query.status;
      }

      const { rows, count } = await this.ordersRepository.findAndCountAll({
        where,
        include: [{ model: OrderItems, as: 'items' }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      const [pendingCount, confirmedCount, cancelledCount] = await Promise.all([
        this.ordersRepository.count({ where: { status: ordersStatus.PENDING } }),
        this.ordersRepository.count({ where: { status: ordersStatus.CONFIRMED } }),
        this.ordersRepository.count({ where: { status: ordersStatus.CANCELLED } }),
      ]);

      return {
        items: rows.map((o) => new ordersDto(o)),
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
        counts: {
          pending: pendingCount,
          confirmed: confirmedCount,
          cancelled: cancelledCount,
        },
      };
    } catch (error: unknown) {
      const err = error as { message?: string; stack?: string };
      this.logger.error(
        `Error fetching all orders: ${err.message ?? 'Unknown error'}`,
        err.stack,
      );
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async getOrderByNumber(
    orderNumber: string,
    user: { sub: string; role: string },
  ) {
    try {
      this.logger.debug(`Fetching order - order_number: ${orderNumber}`);
      const order = await this.ordersRepository.findOne({
        where: { order_number: orderNumber },
        include: [{ model: OrderItems, as: 'items' }],
      });
      if (!order) {
        throw this.errorMessageService.GeneralErrorCore('Order not found', 404);
      }

      const isAdmin = user.role === 'ADMIN';
      const isOwner = order.user_id && order.user_id === user.sub;
      if (!isAdmin && !isOwner) {
        throw new ForbiddenException('You can only view your own order');
      }

      return new ordersDto(order);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 404 || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(
        `Error fetching order - order_number: ${orderNumber}: ${err.message ?? 'Unknown error'}`,
        err.stack,
      );
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async confirmOrder(id: string) {
    try {
      this.logger.log(`Confirming order - ID: ${id}`);
      const order = await this.ordersRepository.findByPk(id, {
        include: [{ model: OrderItems, as: 'items' }],
      });
      if (!order) {
        throw this.errorMessageService.GeneralErrorCore('Order not found', 404);
      }
      if (order.status !== ordersStatus.PENDING) {
        throw this.errorMessageService.GeneralErrorCore(
          'Only pending orders can be confirmed',
          400,
        );
      }

      await this.ordersRepository.update(
        {
          status: ordersStatus.CONFIRMED,
          confirmed_at: new Date(),
        } as any,
        { where: { id } },
      );

      const updated = await this.ordersRepository.findByPk(id, {
        include: [{ model: OrderItems, as: 'items' }],
      });
      this.logger.log(`Order confirmed - ID: ${id}`);
      return new ordersDto(updated);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (err.status === 404 || err.status === 400) {
        throw error;
      }
      this.logger.error(
        `Error confirming order - ID: ${id}: ${err.message ?? 'Unknown error'}`,
        err.stack,
      );
      throw this.errorMessageService.CatchHandler(error);
    }
  }

  async cancelOrder(
    id: string,
    body: orderCancelDto,
    user: { sub: string; role: string },
  ) {
    try {
      this.logger.log(`Cancelling order - ID: ${id}`);
      const order = await this.ordersRepository.findByPk(id, {
        include: [{ model: OrderItems, as: 'items' }],
      });
      if (!order) {
        throw this.errorMessageService.GeneralErrorCore('Order not found', 404);
      }

      const isAdmin = user.role === 'ADMIN';
      const isOwner = order.user_id && order.user_id === user.sub;

      if (!isAdmin && !isOwner) {
        throw new ForbiddenException('You can only cancel your own order');
      }

      if (!isAdmin) {
        if (order.status !== ordersStatus.PENDING) {
          throw this.errorMessageService.GeneralErrorCore(
            'Only pending orders can be cancelled by owner',
            400,
          );
        }
      } else {
        if (
          order.status !== ordersStatus.PENDING &&
          order.status !== ordersStatus.CONFIRMED
        ) {
          throw this.errorMessageService.GeneralErrorCore(
            'Only pending or confirmed orders can be cancelled',
            400,
          );
        }
      }

      await this.ordersRepository.update(
        {
          status: ordersStatus.CANCELLED,
          cancelled_at: new Date(),
          cancel_reason: body.reason ?? null,
        } as any,
        { where: { id } },
      );

      const updated = await this.ordersRepository.findByPk(id, {
        include: [{ model: OrderItems, as: 'items' }],
      });
      this.logger.log(`Order cancelled - ID: ${id}`);
      return new ordersDto(updated);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; stack?: string };
      if (
        err.status === 404 ||
        err.status === 400 ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Error cancelling order - ID: ${id}: ${err.message ?? 'Unknown error'}`,
        err.stack,
      );
      throw this.errorMessageService.CatchHandler(error);
    }
  }
}
