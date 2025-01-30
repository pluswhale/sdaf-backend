import dotenv from 'dotenv';
import { UsdtTransactionsChecker } from '../services/hedger/UsdtTransactionsChecker';
import { FINALISE_WALLETS, RECEIVER_WALLETS } from '../services/hedger/utils';
import { placeOrderToBinanceResolver } from '../services/hedger/PlaceOrderToBinanceResolver';
import { BtcTransactionsChecker } from '../services/hedger/BtcTransactionsChecker';
import { BnbTransactionsChecker } from '../services/hedger/BnbTransactionsChecker';
import { sleep } from '../utils/sleep';

dotenv.config();

let isRunning = false;

async function hedgerMonitoringService(): Promise<void> {
  const usdtBnbOrdersNeedToBeResolved = await UsdtTransactionsChecker(
    RECEIVER_WALLETS.usdt_bnb.walletAddress,
    RECEIVER_WALLETS.usdt_bnb.symbol,
    RECEIVER_WALLETS.usdt_bnb.direction,
    'receiver',
  );

  await sleep(2000);

  const usdtBtcOrdersNeedToBeResolved = await UsdtTransactionsChecker(
    RECEIVER_WALLETS.usdt_btc.walletAddress,
    RECEIVER_WALLETS.usdt_btc.symbol,
    RECEIVER_WALLETS.usdt_btc.direction,
    'receiver',
  );

  await sleep(2000);

  const bnbOrdersToBeResolved = await BnbTransactionsChecker(
    RECEIVER_WALLETS.bnb_usdt.walletAddress,
    RECEIVER_WALLETS.bnb_usdt.symbol,
    RECEIVER_WALLETS.bnb_usdt.direction,
    'receiver',
  );

  await sleep(2000);

  const btcOrdersNeedToBeResolved = await BtcTransactionsChecker(
    RECEIVER_WALLETS.btc_usdt.walletAddress,
    RECEIVER_WALLETS.btc_usdt.symbol,
    RECEIVER_WALLETS.btc_usdt.direction,
    'receiver',
  );

  //TODO: add others finalise
  const btcTransactionsThatFinalised = await BtcTransactionsChecker(
    FINALISE_WALLETS.btc_usdt.walletAddress,
    FINALISE_WALLETS.btc_usdt.symbol,
    FINALISE_WALLETS.btc_usdt.direction,
    'finalise',
  );

  await sleep(2000);

  const bnbTransactionsThatFinalised = await BnbTransactionsChecker(
    FINALISE_WALLETS.bnb_usdt.walletAddress,
    FINALISE_WALLETS.bnb_usdt.symbol,
    FINALISE_WALLETS.bnb_usdt.direction,
    'finalise',
  );

  await sleep(2000);

  const usdtBnbTransactionsThatFinalised = await UsdtTransactionsChecker(
    FINALISE_WALLETS.usdt_bnb.walletAddress,
    FINALISE_WALLETS.usdt_bnb.symbol,
    FINALISE_WALLETS.usdt_bnb.direction,
    'finalise',
  );

  await sleep(2000);

  const usdtBtcTransactionsThatFinalised = await UsdtTransactionsChecker(
    FINALISE_WALLETS.usdt_btc.walletAddress,
    FINALISE_WALLETS.usdt_btc.symbol,
    FINALISE_WALLETS.usdt_btc.direction,
    'finalise',
  );

  await sleep(2000);


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
    console.log('Scheduled tasks completed successfully.');
  } catch (error) {
    console.error('Error during scheduled tasks:', error);
  } finally {
    isRunning = false;
  }
}, 3000); // Run every 3 seconds
