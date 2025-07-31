import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppDataSource } from './db/AppDataSource';
import appRoutes from './routes/appRoutes';
import cookieParser from 'cookie-parser';
import { seedUsers } from './db/seeders/UserSeeder';
import { seedBotOrder } from './db/seeders/BotOrderSeeder';
import './middlewares/hedgingEngine';
import './middlewares/walletHistory/walletBalanceHistory';
import { hedgerOptionsSeeder } from './db/seeders/HedgerOptionsSeeder';
import { permissionSeeder } from './db/seeders/PermissionSeeder';
import { roleSeeder } from './db/seeders/RoleSeeder';

dotenv.config();

if (process.env.GITLAB_ENVIRONMENT_NAME && process.env.GITLAB_ENVIRONMENT_NAME.includes('green')) {
  import('./middlewares/walletScheduler');
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://sdafcwap.com',
      'https://blue.sdafcwap.com',
      'https://staging.sdafcwap.com',
      'http://localhost:5000',
      'https://cwap3.coinhq.store',
      'https://app.cwap.io/botHedging',
      'https://cwap3.coinhq.store',
      'https://cwap5.coinhq.store',
      'https://beta.cwap.io',
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
  console.log('Seeding roles ...');
  await roleSeeder(AppDataSource);
  console.log('Seeding permissions ...');
  await permissionSeeder(AppDataSource);
  console.log('Seeding users...');
  await seedUsers(AppDataSource);
  console.log('Seeding margins...');
  // await seedMargins(AppDataSource);
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
        console.error('Error during se99ed55ing:', error);
      });
  })
  .catch((error) => console.log('Error connecting to database:', error));

app.use('/api/', appRoutes);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
