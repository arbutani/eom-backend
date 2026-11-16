/* eslint-disable prettier/prettier */

import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Orders } from './orders.entity';

@Table({
  tableName: 'order_items',
  timestamps: true,
})
export class OrderItems extends Model<OrderItems> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => Orders)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare order_id: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare product_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare product_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare size: string | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare unit_price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare line_total: number;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    field: 'updated_at',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare updatedAt: Date;

  @BelongsTo(() => Orders)
  declare order: Orders;
}
