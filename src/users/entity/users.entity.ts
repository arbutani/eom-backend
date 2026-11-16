/* eslint-disable prettier/prettier */

import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class Users extends Model<Users> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare google_id: string;

  @Column({
    type: DataType.ENUM('admin', 'user', 'worker'),
    allowNull: false,
    defaultValue: 'user',
    field: 'role',
  })
  declare role: 'admin' | 'user' | 'worker';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_active: boolean;

  @Column({
    type: DataType.STRING(15),
    allowNull: true,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare address_line: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare landmark: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare city: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare state: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
  })
  declare pincode: string;

  @Column({
    type: DataType.DECIMAL(9, 6),
    allowNull: true,
  })
  declare latitude: number;

  @Column({
    type: DataType.DECIMAL(9, 6),
    allowNull: true,
  })
  declare longitude: number;

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
}
