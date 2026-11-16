/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ErrorMessageService } from '../../shared/services/errormessage.service';
import { SuccessResponseDto } from '../../shared/dto/successResponse.dto';
import { OrdersService } from '../service/orders.service';
import { ordersRequestDto } from '../dto/ordersRequest.dto';
import { ordersQueryDto } from '../dto/ordersQuery.dto';
import { orderCancelDto } from '../dto/orderCancel.dto';
import { JwtAuthGuard } from 'src/JwtAuthGuard/jwt_auth.guard';
import { OptionalJwtAuthGuard } from 'src/JwtAuthGuard/optional_jwt_auth.guard';
import { CurrentUser } from 'src/JwtAuthGuard/current-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/guards/roles.decorator';
import { usersRole } from '../../enum/users/usersType.enum';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly errorMessageService: ErrorMessageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async createOrder(
    @Body() requestDto: ordersRequestDto,
    @CurrentUser('sub') userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const data = await this.ordersService.createOrder(requestDto, userId);
      return this.errorMessageService.success(
        data,
        true,
        'Order created successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(
    @CurrentUser('sub') userId: string,
    @Query() query: ordersQueryDto,
  ): Promise<SuccessResponseDto> {
    try {
      const data = await this.ordersService.getMyOrders(userId, query);
      return this.errorMessageService.success(
        data,
        true,
        'Orders retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(usersRole.ADMIN)
  @Get()
  async getAllOrders(
    @CurrentUser() user: { role: string },
    @Query() query: ordersQueryDto,
  ): Promise<SuccessResponseDto> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.ordersService.getAllOrders(query);
      return this.errorMessageService.success(
        data,
        true,
        'Orders retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':order_number')
  async getOrderByNumber(
    @Param('order_number') orderNumber: string,
    @CurrentUser() user: { sub: string; role: string },
  ): Promise<SuccessResponseDto> {
    try {
      const data = await this.ordersService.getOrderByNumber(orderNumber, user);
      return this.errorMessageService.success(
        data,
        true,
        'Order retrieved successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(usersRole.ADMIN)
  @Patch(':id/confirm')
  async confirmOrder(
    @Param('id') id: string,
    @CurrentUser() user: { role: string },
  ): Promise<SuccessResponseDto> {
    if (user.role !== usersRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    try {
      const data = await this.ordersService.confirmOrder(id);
      return this.errorMessageService.success(
        data,
        true,
        'Order confirmed successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: orderCancelDto,
    @CurrentUser() user: { sub: string; role: string },
  ): Promise<SuccessResponseDto> {
    try {
      const data = await this.ordersService.cancelOrder(id, body, user);
      return this.errorMessageService.success(
        data,
        true,
        'Order cancelled successfully',
        {},
      );
    } catch (error) {
      throw this.errorMessageService.error(error);
    }
  }
}
