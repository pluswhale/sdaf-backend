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
import { BnbTransactionsInternalChecker } from '../services/hedger/BnbTransactionsInternalChecker';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

let isRunning = false;

async function hedgerMonitoringService(): Promise<void> {
  const usdtOrdersNeedToBeResolved = await UsdtTransactionsChecker(
    RECEIVER_WALLETS.usdt_bnb.walletAddress,
    RECEIVER_WALLETS.usdt_bnb.symbol,
    RECEIVER_WALLETS.usdt_bnb.direction,
  );

  await sleep(1500);

  const bnbOrdersToBeResolved = await BnbTransactionsChecker(
    RECEIVER_WALLETS.bnb_usdt.walletAddress,
    RECEIVER_WALLETS.bnb_usdt.symbol,
    RECEIVER_WALLETS.bnb_usdt.direction,
  );

  const bnbInternalOrdersToBeResolved = await BnbTransactionsInternalChecker(
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

  if (usdtOrdersNeedToBeResolved) {
    const prices = await axios.get('https://sdafcwap.com/app/api/get-asset-price');
    const btcFinalizerTxs = await BtcTransactionsFinaliseChecker(FINALISE_WALLETS.btc_usdt.walletAddress);
    console.log('btcFinalizerTxs: ', btcFinalizerTxs);
    const bnbFinalizerTxs = await BnbTransactionsFinaliseChecker(FINALISE_WALLETS.bnb_usdt.walletAddress);
    console.log('bnbFinalizerTxs: ', bnbFinalizerTxs);

    if(usdtOrdersNeedToBeResolved.transactions && usdtOrdersNeedToBeResolved.transactions.length > 0) {
      for(let usdtTx of usdtOrdersNeedToBeResolved.transactions) {
        if(btcFinalizerTxs && btcFinalizerTxs.length > 0) {
          for(let btcFinalizeTx of btcFinalizerTxs) {
            const BTC_THRESHOLD = Math.abs(Number(ethers.formatUnits(usdtTx.value, 18)) - (btcFinalizeTx.vin[0].prevout.value / 1e8) * prices.data.BTC)/(Number(ethers.formatUnits(usdtTx.value, 18)))
            console.log(BTC_THRESHOLD)
            if(usdtTx.timeStamp > btcFinalizeTx.status.block_time && BTC_THRESHOLD <= 0.1 ) { // 0.1 - threshold for the amount diff
              await placeOrderToBinanceResolver({ symbol: 'BTC-USDT', direction: 'BUY', transactions: usdtOrdersNeedToBeResolved.transactions})
            }
          }
        }

        if(bnbFinalizerTxs && bnbFinalizerTxs.length > 0) {
          for(let bnbFinalizeTx of bnbFinalizerTxs) {
            const BNB_THRESHOLD = Math.abs(Number(ethers.formatUnits(usdtTx.value, 18)) - Number(ethers.formatUnits(bnbFinalizeTx.value, 18)) * prices.data.BNB)/(Number(ethers.formatUnits(usdtTx.value, 18)))
            if(usdtTx.timeStamp > bnbFinalizeTx.timestamp && BNB_THRESHOLD  <= 0.1 ) { // 0.1 - threshold for the amount diff
              await placeOrderToBinanceResolver({ symbol: 'BNB-USDT', direction: 'BUY', transactions: usdtOrdersNeedToBeResolved.transactions})
            }
          } 
        }
      }
    } 
    await placeOrderToBinanceResolver(usdtOrdersNeedToBeResolved);
  }

  if (bnbOrdersToBeResolved) {
    await placeOrderToBinanceResolver(bnbOrdersToBeResolved);
  }

  if (bnbInternalOrdersToBeResolved) {
    await placeOrderToBinanceResolver(bnbInternalOrdersToBeResolved);
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
    // await UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_bnb.walletAddress, FINALISE_WALLETS.usdt_bnb.symbol);
    await sleep(2000);
    await UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_btc.walletAddress, FINALISE_WALLETS.usdt_btc.symbol);
    await sleep(2000);
    await BtcTransactionsFinaliseChecker(FINALISE_WALLETS.btc_usdt.walletAddress);
    await sleep(2000);
    // await BnbTransactionsFinaliseChecker(FINALISE_WALLETS.bnb_usdt.walletAddress);

    console.log('Scheduled tasks completed successfully.');
  } catch (error) {
    console.error('Error during scheduled tasks:', error);
  } finally {
    isRunning = false;
  }
}, 3000); // Run every 3 seconds
