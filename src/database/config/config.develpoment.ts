/* eslint-disable prettier/prettier */

import type { Dialect, Options } from 'sequelize';
import { Logger } from '@nestjs/common';

const logger = new Logger('Sequelize');

export const config_dev = {
  database: {
    dialect: 'postgres' as Dialect,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'root123',
    database: process.env.DB_DATABASE ?? 'google',
    logging: process.env.DB_LOGGING === 'false'
      ? false
      : (sql: string) => logger.debug(sql),
    pool: {
      acquire: 30000,
    },
  } as Options,
};
