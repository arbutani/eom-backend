/* eslint-disable prettier/prettier */

import { Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { TableList } from '../tablesList';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env', quiet: true });

const logger = new Logger('Sequelize');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const databaseProviders = [
  {
    provide: Sequelize,
    useFactory: async () => {
      const databaseUrl = process.env.DATABASE_URL;

      const baseConfig: any = {
        logging:
          process.env.DB_LOGGING === 'true'
            ? (sql: string) => logger.debug(sql)
            : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 30000,
        },
        dialectOptions: {},
      };

      // Free-tier databases can take a few seconds to wake up. Give the
      // TCP connect attempt a generous 30s timeout.
      baseConfig.dialectOptions.connectionTimeoutMillis = 30000;

      if (process.env.DB_SSL === 'true') {
        baseConfig.dialectOptions.ssl = {
          require: true,
          rejectUnauthorized: false,
        };
      }

      const sequelize = databaseUrl
        ? new Sequelize(databaseUrl, {
            dialect: 'postgres',
            ...baseConfig,
          })
        : new Sequelize({
            dialect: 'postgres',
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 5432),
            username: process.env.DB_USER ?? process.env.DB_USERNAME ?? 'postgres',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME ?? process.env.DB_DATABASE,
            ...baseConfig,
          });

      sequelize.addModels([...TableList]);

      // Retry connecting because idle free-tier databases sleep and need
      // a few seconds to wake up. Do not crash the boot if it is still
      // down; Sequelize connects lazily on the first request.
      let lastError: unknown;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          await sequelize.authenticate();
          logger.log('Database connection established');
          return sequelize;
        } catch (error) {
          lastError = error;
          logger.warn(
            `Database connection attempt ${attempt} failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          if (attempt < 5) {
            await sleep(2000 * attempt);
          }
        }
      }

      logger.warn(
        `Database unavailable after 5 attempts (last error: ${lastError instanceof Error ? lastError.message : String(lastError)}). Retrying lazily on first request.`,
      );
      return sequelize;
    },
  },
];
