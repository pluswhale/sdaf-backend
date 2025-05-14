import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppDataSource } from './db/AppDataSource';
import appRoutes from './routes/appRoutes';
import cookieParser from 'cookie-parser';
import { seedMargins } from './db/seeders/MarginSeeder';
import './middlewares/walletScheduler';
import { seedUsers } from './db/seeders/UserSeeder';
import { seedBotOrder } from './db/seeders/BotOrderSeeder';
import './middlewares/hedgingEngine';
import './middlewares/walletHistory/walletBalanceHistory';
import { hedgerOptionsSeeder } from './db/seeders/HedgerOptionsSeeder';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://sdafcwap.com',
      'http://localhost:5000',
      'https://cwap3.coinhq.store',
      'https://app.cwap.io/botHedging',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  }),
);

app.use(cookieParser());

app.get('/', async (req, res) => {
  try {
    res.send({ text: 'TEST APIS' });
  } catch (error) {
    res.status(500).send('Failed to start bot');
  }
});

async function runSeeders() {
  console.log('Seeding users...');
  await seedUsers(AppDataSource);
  console.log('Seeding margins...');
  await seedMargins(AppDataSource);
  console.log('Seeding bot order...');
  await seedBotOrder(AppDataSource);
  console.log('Seeding hedger options....');
  await hedgerOptionsSeeder(AppDataSource);
}

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    app.listen(process.env.PORT, () => {
      console.log(`Server! is running on port: ${process.env.PORT}`);
    });
    runSeeders()
      .then(() => {
        console.log('Seeding completed successfully.');
      })
      .catch((error) => {
        console.error('Error during seeding:', error);
      });
  })
  .catch((error) => console.log('Error connecting to database:', error));

app.use('/api/', appRoutes);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
