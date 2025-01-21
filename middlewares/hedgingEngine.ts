import * as cron from 'node-cron';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import { AppDataSource } from '../db/AppDataSource';
import { HedgingEngine } from '../db/entities/HedgingEngine';

dotenv.config();

let isRunning = false;

const limiter = new Bottleneck({
  reservoir: 3,
  reservoirRefreshAmount: 3,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 1,
});

const hedgingEngineRepo = AppDataSource.getRepository(HedgingEngine);

async function getTransactionConfirmations(txHash: string): Promise<number> {
  try {
    const resultConfirmations = await axios.get(`https://sdafcwap.com/app/api/get-confirmations?txHash=${txHash}`);
    const { confirmations } = resultConfirmations.data;
    return confirmations;
  } catch (error) {
    console.error(`Error fetching confirmations for ${txHash}:`, error);
    throw error;
  }
}

async function trackMultipleTransactions(): Promise<void> {
  const transactionsToTrack = await hedgingEngineRepo.find({ where: { confirmations: 0 } });

  const txHashes = transactionsToTrack.map((transaction) => transaction.transactionHash);

  for (const txHash of txHashes) {
    let confirmationsCount = 0;

    while (confirmationsCount <= 0) {
      try {
        confirmationsCount = await getTransactionConfirmations(txHash);
        console.log(`Transaction ${txHash}: Current confirmations: ${confirmationsCount}`);

        if (confirmationsCount <= 0) {
          console.log(`Transaction ${txHash}: Waiting for confirmations...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Transaction ${txHash}: Error fetching confirmations`, error);
        break;
      }
    }

    // CONTINUE LOGIC WITH BINANCE API
    if (confirmationsCount > 0) {
      try {
        await hedgingEngineRepo.delete({ transactionHash: txHash });
        console.log(
          `Transaction ${txHash}: Confirmed with ${confirmationsCount} confirmations. Deleted from database.`,
        );
      } catch (error) {
        console.error(`Error deleting transaction ${txHash} from database:`, error);
      }
    }
  }

  console.log('All transactions are confirmed!');
}

cron.schedule('* * * * *', () => {
  if (isRunning) {
    console.warn('Previous task HedgingEngine is still running. Skipping current run.');
    return;
  }

  isRunning = true;
  (async () => {
    try {
      console.log('Starting scheduled tasks: get Confirmations and Initiate Binance Buy/Sell');

      await trackMultipleTransactions();

      console.log('Scheduled tasks completed successfully.');
    } catch (error) {
      console.error('Error during scheduled tasks:', error);
    } finally {
      isRunning = false;
    }
  })();
});

