import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Wallet } from './entities/Wallet';
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
export default InitDataSource;
