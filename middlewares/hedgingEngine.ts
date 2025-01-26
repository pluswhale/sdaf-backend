import dotenv from 'dotenv';
import { UsdtTransactionsChecker } from '../services/hedger/UsdtTransactionsChecker';
import { RECEIVER_WALLETS } from '../services/hedger/utils';
import {
  placeOrderToBinanceResolver,
} from '../services/hedger/PlaceOrderToBinanceResolver';

dotenv.config();

let isRunning = false;

async function hedgerMonitoringService(): Promise<void> {
   const usdtOrdersNeedToBeResolved = await UsdtTransactionsChecker(RECEIVER_WALLETS.usdt_bnb.walletAddress, RECEIVER_WALLETS.usdt_bnb.symbol, RECEIVER_WALLETS.usdt_bnb.direction);

   if (usdtOrdersNeedToBeResolved) {
     await placeOrderToBinanceResolver(usdtOrdersNeedToBeResolved);
   }
}

setInterval(async () => {
  if (isRunning) {
    console.warn('Previous task HedgingEngine is still running. Skipping current run.');
    return;
  }
  isRunning = true;
  try {
    console.log('Starting scheduled tasks: get Confirmations and Initiate Binance Buy/Sell');
    await hedgerMonitoringService();
    console.log('Scheduled tasks completed successfully.');
  } catch (error) {
    console.error('Error during scheduled tasks:', error);
  } finally {
    isRunning = false;
  }
}, 3000); // Run every 3 seconds

