import dotenv from 'dotenv';
import { UsdtTransactionsChecker } from '../services/hedger/UsdtTransactionsChecker';
import { FINALISE_WALLETS, RECEIVER_WALLETS } from '../services/hedger/utils';
import { placeOrderToBinanceResolver } from '../services/hedger/PlaceOrderToBinanceResolver';
import { BtcTransactionsChecker } from '../services/hedger/BtcTransactionsChecker';
import { BnbTransactionsChecker } from '../services/hedger/BnbTransactionsChecker';
import { sleep } from '../utils/sleep';
import { UsdtTransactionsFinaliseChecker } from '../services/hedger/UsdtTransactionsFinaliseChecker';
import { BtcTransactionsFinaliseChecker } from '../services/hedger/BtcTransactionsFinaliseChecker';
import { BnbTransactionsFinaliseChecker } from '../services/hedger/BnbTransactionsFinaliseChecker';

dotenv.config();

let isRunning = false;

async function hedgerMonitoringService(): Promise<void> {

  const usdtBnbOrdersNeedToBeResolved = await UsdtTransactionsChecker(
    RECEIVER_WALLETS.usdt_bnb.walletAddress,
    RECEIVER_WALLETS.usdt_bnb.symbol,
    RECEIVER_WALLETS.usdt_bnb.direction,
  );

  await sleep(1500);

  const usdtBtcOrdersNeedToBeResolved = await UsdtTransactionsChecker(
    RECEIVER_WALLETS.usdt_btc.walletAddress,
    RECEIVER_WALLETS.usdt_btc.symbol,
    RECEIVER_WALLETS.usdt_btc.direction,
  );

  await sleep(1500);

  const bnbOrdersToBeResolved = await BnbTransactionsChecker(
    RECEIVER_WALLETS.bnb_usdt.walletAddress,
    RECEIVER_WALLETS.bnb_usdt.symbol,
    RECEIVER_WALLETS.bnb_usdt.direction,
  );

  await sleep(1500);

  const btcOrdersNeedToBeResolved = await BtcTransactionsChecker(
    RECEIVER_WALLETS.btc_usdt.walletAddress,
    RECEIVER_WALLETS.btc_usdt.symbol,
    RECEIVER_WALLETS.btc_usdt.direction,
  );

  if (usdtBnbOrdersNeedToBeResolved) {
    await placeOrderToBinanceResolver(usdtBnbOrdersNeedToBeResolved);
  }

  if (usdtBtcOrdersNeedToBeResolved) {
    await placeOrderToBinanceResolver(usdtBtcOrdersNeedToBeResolved);
  }

  if (bnbOrdersToBeResolved) {
    await placeOrderToBinanceResolver(bnbOrdersToBeResolved);
  }

  if (btcOrdersNeedToBeResolved) {
    await placeOrderToBinanceResolver(btcOrdersNeedToBeResolved);
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

    //Finalise
    await UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_bnb.walletAddress, FINALISE_WALLETS.usdt_bnb.symbol);
    await sleep(2000);
    await UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_btc.walletAddress, FINALISE_WALLETS.usdt_btc.symbol)
    await sleep(2000);
    await BtcTransactionsFinaliseChecker(FINALISE_WALLETS.btc_usdt.walletAddress);
    await sleep(2000);
    await BnbTransactionsFinaliseChecker(FINALISE_WALLETS.bnb_usdt.walletAddress);

    console.log('Scheduled tasks completed successfully.');
  } catch (error) {
    console.error('Error during scheduled tasks:', error);
  } finally {
    isRunning = false;
  }
}, 3000); // Run every 3 seconds
