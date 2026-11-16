/* eslint-disable prettier/prettier */

import { Sequelize } from 'sequelize-typescript';
import { TableList } from '../tablesList';
import { config_dev } from '../config/config.develpoment';
import * as dotenv from 'dotenv';
import { config_prod } from '../config/config.production';
dotenv.config({ path: '.env', quiet: true });
const environment = process.env.TYPE ?? 'local';

export const databaseProviders = [
  {
    provide: Sequelize,
    useFactory: async () => {
      const dbConfig = environment == 'local' ? config_dev.database : config_prod.database;
      const sequelize = new Sequelize(dbConfig);
      sequelize.addModels([...TableList]);
      return sequelize;
    },
  },
];
