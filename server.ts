import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppDataSource } from './db/AppDataSource';
import appRoutes from './routes/appRoutes';
import cookieParser from 'cookie-parser';
import { seedMargins } from './db/seeders/MarginSeeder';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://sdafcwap.com'], // Replace with your frontend's actual origin
    credentials: true, // Allows cookies and other credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the methods your API supports
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'], // Specify necessary headers
  }),
);
app.use(cookieParser());

app.get('/', async (req, res) => {
  try {
    res.send('Bot started');
  } catch (error) {
    res.status(500).send('Failed to start bot');
  }
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    await seedMargins(AppDataSource);
  })
  .catch((error) => console.log('Error connecting to database:', error));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});

app.use('/api/', appRoutes);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

