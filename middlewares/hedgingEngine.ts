import * as cron from 'node-cron';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import { AppDataSource } from '../db/AppDataSource';
import { HedgingEngine } from '../db/entities/HedgingEngine';
import Binance, { OrderType } from 'binance-api-node';

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_KEY,
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

const mapToSymbol = {
  BNBUSDT: 'BNBUSDT',
  USDTBNB: 'BNBUSDT',
  BTCUSDT: 'BTCUSDT',
  USDTBTC: 'BTCUSDT',
};

async function placeBinanceOrderAndEnsureFulfillment(fromCoin: string, toCoin: string, amount: string): Promise<void> {
  //@ts-ignore
  const symbol = mapToSymbol[`${fromCoin}${toCoin}`];
  const side = symbol === `${fromCoin}${toCoin}` ? 'SELL' : 'BUY';
  const quantity = amount;

  let orderFulfilled = false;

  while (!orderFulfilled) {
    try {
      // Place a limit order
      const order = await client.order({
        symbol,
        side,
        type: OrderType.LIMIT,
        price: '300', // Dynamically compute this price as needed
        quantity: quantity,
        timeInForce: 'GTC',
      });

      console.log(`Limit order placed. Order ID: ${order.orderId}`);

      // Check the order status
      const maxRetries = 2; // Limit retries to avoid infinite loops
      let retries = 0;

      while (retries < maxRetries) {
        //@ts-ignore
        const orderStatus = await checkOrderStatus(order.orderId, fromCoin, toCoin);

        //@ts-ignore
        if (orderStatus.status === 'FILLED') {
          console.log(`Order ${order.orderId} has been fulfilled.`);
          orderFulfilled = true;
          break;
        }

        console.log(`Order ${order.orderId} not fulfilled yet. Retrying in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retries++;
      }

      if (!orderFulfilled) {
        console.log(`Order ${order.orderId} was not fulfilled after ${maxRetries} retries. Recreating order.`);
        // Cancel the unfulfilled order before retrying
        await client.cancelOrder({
          symbol,
          orderId: order.orderId,
        });
      }
    } catch (error) {
      console.error('Error placing or checking Binance order:', error);
    }
  }
}

async function checkOrderStatus(orderId: string, fromCoin: string, toCoin: string): Promise<any> {
  //@ts-ignore
  const symbol = mapToSymbol[`${fromCoin}${toCoin}`];

  try {
    const orderStatus = await client.getOrder({
      symbol,
      orderId: Number(orderId),
    });
    console.log(`Order Status for ${orderId}:`, orderStatus);
    return orderStatus;
  } catch (error) {
    console.error(`Error checking order status for Order ID ${orderId}:`, error);
    throw error; // Ensure this propagates for retry logic
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
          await placeBinanceOrderAndEnsureFulfillment(fromCoin, toCoin, amount);
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

