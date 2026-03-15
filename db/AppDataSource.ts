import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  BotOrder,
  FinaliseLog,
  Margin,
  PendingReplenishment,
  PendingWithdrawal,
  Wallet,
  HedgineEngineLog,
  ActiveSessionTracker,
  Permission,
  Role,
  AmlCheckedWallet,
} from './entities';
import { User } from './entities';

import dotenv from 'dotenv';
import { HedgerConfigOptions } from './entities/HedgerConfigOptions';

dotenv.config();

console.log('process.env.DB_URL: ' + process.env.DB_URL);

const InitDataSource = () => {
  const dbHost = process.env.DB_HOST;

  console.log('dbHost: ' + dbHost);

  if (dbHost) {
    return new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123',
      database: process.env.DB_NAME || 'sdaf',
      synchronize: true,
      logging: false,
      entities: [Wallet],
      migrations: [],
      subscribers: [],
    });
  }
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  // host: process.env.DB_HOST || 'localhost',
  // port: parseInt(process.env.DB_PORT || '5432'),
  // username: process.env.DB_USER || 'postgres',
  // password: process.env.DB_PASSWORD || '12345',
  // database: process.env.DB_NAME || 'test',
  url: process.env.DB_URL || '',
  ssl: { rejectUnauthorized: false },
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  synchronize: true,
  logging: false,
  entities: [
    HedgerConfigOptions,
    Wallet,
    User,
    Margin,
    PendingWithdrawal,
    PendingReplenishment,
    BotOrder,
    HedgineEngineLog,
    FinaliseLog,
    ActiveSessionTracker,
    Permission,
    Role,
    AmlCheckedWallet,
  ],
  migrations: [],
  subscribers: [],
});

export default InitDataSource;
