import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Wallet } from './entities/Wallet';
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '30000'),
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'testing-password',
    database: process.env.DB_NAME || 'sdaf',
    synchronize: true,
    logging: false,
    entities: [Wallet],
    migrations: [],
    subscribers: [],
});
