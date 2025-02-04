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

import axios from 'axios';
import { createFinaliseLog, getFinaliseLogByTxId } from '../services/hedgineEngineHistoryLog';
import { ethers } from 'ethers';

dotenv.config();

let isRunning = false;

const PROFIT_TRASHHOLD = 3;
const MARGIN_PERCENT = 1.1;

async function hedgerMonitoringService(): Promise<void> {

  const usdtBnbAndBtcOrdersNeedToBeResolved = await UsdtTransactionsChecker(
    RECEIVER_WALLETS.usdt_bnb.walletAddress,
    RECEIVER_WALLETS.usdt_bnb.symbol,
    RECEIVER_WALLETS.usdt_bnb.direction,
  );


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

  const concatedUsdtBnbAndUsdtBtcOrdersNeedToBeResolved = {...usdtBnbAndBtcOrdersNeedToBeResolved, ...bnbInternalOrdersToBeResolved, ...bnbOrdersToBeResolved}

  const btcOrdersNeedToBeResolved = await BtcTransactionsChecker(
    RECEIVER_WALLETS.btc_usdt.walletAddress,
    RECEIVER_WALLETS.btc_usdt.symbol,
    RECEIVER_WALLETS.btc_usdt.direction,
  );

  await sleep(1000);

  const finaliseUsdtTxs = await UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_bnb.walletAddress, FINALISE_WALLETS.usdt_bnb.symbol);
  // const finaliseBnbTxs = await BnbTransactionsFinaliseChecker(FINALISE_WALLETS.bnb_usdt.walletAddress);
  // const finaliseBtcTxs = await BtcTransactionsFinaliseChecker(FINALISE_WALLETS.btc_usdt.walletAddress);
  // const concatedFinaliseTxs = [...finaliseBnbTxs, ...finaliseUsdtTxs, ...finaliseBtcTxs];

  await sleep(1000);

  const prices = await axios.get('https://sdafcwap.com/app/api/get-asset-price');

  // For BTC
  if (btcOrdersNeedToBeResolved) {
    for (let btcOrder of btcOrdersNeedToBeResolved?.transactions) {
      console.log('btc order value', +btcOrder?.value);
      console.log('+prices?.data?.BTC', +prices?.data?.prices?.BTC);
      const btcOrderPriceUsdt = +btcOrder.value  * +prices?.data?.prices?.BTC;

      for (let usdtFinalise of finaliseUsdtTxs) {
        const usdtFinalisePrice = +ethers.formatUnits(usdtFinalise.value, 18) * MARGIN_PERCENT;
        console.log('usdtFinalisePrice', usdtFinalisePrice);
        console.log('btcOrderPriceUsdt', btcOrderPriceUsdt);
        console.log('btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD', btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD);
        if (btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD) {
          await placeOrderToBinanceResolver(btcOrdersNeedToBeResolved);

          const finaliseRow = getFinaliseLogByTxId(usdtFinalise.hash);
          if(!finaliseRow) {
            await createFinaliseLog({
              txHash: usdtFinalise.txid,
              currency: 'USDT',
              l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
            });
          }
        } else {

        }
      }
    }
  }



  // for (let usdtBnbAndBtcOrder of concatedUsdtBnbAndUsdtBtcOrdersNeedToBeResolved) {
  //   for ()
  //
  //
  // }



  // if (usdtBnbOrdersNeedToBeResolved) {
  //   await placeOrderToBinanceResolver(usdtBnbOrdersNeedToBeResolved);
  // }

  // if (usdtBtcOrdersNeedToBeResolved) {
  //   await placeOrderToBinanceResolver(usdtBtcOrdersNeedToBeResolved);
  // }

  // if (bnbOrdersToBeResolved) {
  //   await placeOrderToBinanceResolver(bnbOrdersToBeResolved);
  // }

  // if (bnbInternalOrdersToBeResolved) {
  //   await placeOrderToBinanceResolver(bnbInternalOrdersToBeResolved);
  // }

  // if (btcOrdersNeedToBeResolved) {
  //   await placeOrderToBinanceResolver(btcOrdersNeedToBeResolved);
  // }
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
}, 5000); // Run every 5 seconds
