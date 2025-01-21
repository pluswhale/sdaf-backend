import * as cron from 'node-cron';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import { AppDataSource } from '../db/AppDataSource';
import { HedgingEngine } from '../db/entities/HedgingEngine';
import Binance, { OrderType } from 'binance-api-node';

const client = Binance({
  apiKey: 'YOUR_BINANCE_API_KEY', // Replace with your Binance API key
  apiSecret: 'YOUR_BINANCE_API_SECRET', // Replace with your Binance API secret
});

dotenv.config();

let isRunning = false;

const limiter = new Bottleneck({
  reservoir: 3,
  reservoirRefreshAmount: 3,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 1,
});

const hedgingEngineRepo = AppDataSource.getRepository(HedgingEngine);

async function placeBinanceOrder(fromCoin: string, toCoin: string, amount: string): Promise<void> {
  try {
    const symbol = `${fromCoin}${toCoin}`;
    const quantity = amount;

    const order = await client.order({
      symbol: symbol,
      side: 'BUY', // BUY or SELL - which one according to the logic
      type: OrderType.LIMIT,
      price: '300', //think, it will be dinamicly compute
      quantity: quantity,
      timeInForce: 'GTC',
    });

    console.log('Limit order placed:', order);
  } catch (error) {
    console.error('Error placing limit order on Binance:', error);
  }
}

async function checkOrderStatus(orderId: string, fromCoin: string, toCoin: string) {
  try {
    const orderStatus = await client.getOrder({
      symbol: `${fromCoin}${toCoin}`, // Trading pair
      orderId: Number(orderId), // The ID of the order you want to check
    });
    console.log('Order Status:', orderStatus);
  } catch (error) {
    console.error('Error checking order status:', error);
  }
}

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

  for (const transaction of transactionsToTrack) {
    const { transactionHash, fromCoin, toCoin, amount } = transaction;

    let confirmationsCount = 0;

    while (confirmationsCount <= 0) {
      try {
        confirmationsCount = await getTransactionConfirmations(transactionHash);
        console.log(`Transaction ${transactionHash}: Current confirmations: ${confirmationsCount}`);

        if (confirmationsCount <= 0) {
          console.log(`Transaction ${transactionHash}: Waiting for confirmations...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Transaction ${transactionHash}: Error fetching confirmations`, error);
        break;
      }
    }

    // CONTINUE LOGIC WITH BINANCE API
    if (confirmationsCount > 0) {
      try {
        if (fromCoin === 'BNB' && toCoin === 'USDT') {
          await placeBinanceOrder(fromCoin, toCoin, amount);
        }

        await hedgingEngineRepo.delete({ transactionHash });
        console.log(
          `Transaction ${transactionHash}: Confirmed with ${confirmationsCount} confirmations. Deleted from database.`,
        );
      } catch (error) {
        console.error(`Error deleting transaction ${transactionHash} from database:`, error);
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

