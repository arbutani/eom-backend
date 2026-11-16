/* eslint-disable prettier/prettier */

import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Users } from '../../users/entity/users.entity';
import { OrderItems } from './order_items.entity';

@Table({
  tableName: 'orders',
  timestamps: true,
})
export class Orders extends Model<Orders> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  declare order_number: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare user_id: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
  })
  declare status: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare cancel_reason: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare customer_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare customer_phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare address_type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare address_line: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare landmark: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare city: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare state: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare pincode: string;

  @Column({
    type: DataType.DECIMAL(9, 6),
    allowNull: true,
  })
  declare latitude: number | null;

  @Column({
    type: DataType.DECIMAL(9, 6),
    allowNull: true,
  })
  declare longitude: number | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare policy_accepted: boolean;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare total_amount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare confirmed_at: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare cancelled_at: Date | null;

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

  @BelongsTo(() => Users)
  declare user: Users;

  @HasMany(() => OrderItems)
  declare items: OrderItems[];
}
