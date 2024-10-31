import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Wallet } from './entities/Wallet';
const InitDataSource = () => {
    const dbHost = process.env.DB_HOST;
    console.log('dbHost: ' + dbHost);
    if (dbHost) {
        return new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '0'),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: true,
            logging: false,
            entities: [Wallet],
            migrations: [],
            subscribers: [],
        });
    }
};
export default InitDataSource;
