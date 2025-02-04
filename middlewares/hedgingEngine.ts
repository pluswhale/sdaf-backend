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

  const concatedUsdtBnbAndUsdtBtcOrdersNeedToBeResolved = [...usdtBnbAndBtcOrdersNeedToBeResolved, ...bnbInternalOrdersToBeResolved, ...bnbOrdersToBeResolved];

  const btcOrdersNeedToBeResolved = await BtcTransactionsChecker(
    RECEIVER_WALLETS.btc_usdt.walletAddress,
    RECEIVER_WALLETS.btc_usdt.symbol,
    RECEIVER_WALLETS.btc_usdt.direction,
  );

  await sleep(1000);

  const finaliseUsdtTxs = await UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_bnb.walletAddress, FINALISE_WALLETS.usdt_bnb.symbol);
  const finaliseBnbTxs = await BnbTransactionsFinaliseChecker(FINALISE_WALLETS.bnb_usdt.walletAddress);
  const finaliseBtcTxs = await BtcTransactionsFinaliseChecker(FINALISE_WALLETS.btc_usdt.walletAddress);
  // const concatedFinaliseTxs = [...finaliseBnbTxs, ...finaliseUsdtTxs, ...finaliseBtcTxs];

  await sleep(1000);

  const prices = await (axios.get('https://sdafcwap.com/app/api/get-asset-price'))?.data;

  // For BTC
  for (let btcOrder of btcOrdersNeedToBeResolved) {
    const btcOrderPriceUsdt = +btcOrder.value  * +prices.BTC;

    for (let btcFinalise of finaliseBtcTxs) {
      const btcFinalisePriceUsdt = (+btcFinalise.value  * +prices.BTC) * MARGIN_PERCENT;

      if (btcOrderPriceUsdt - btcFinalisePriceUsdt <= PROFIT_TRASHHOLD) {
        await placeOrderToBinanceResolver(btcOrdersNeedToBeResolved);
        await createFinaliseLog({
          txHash: btcFinalise.txid,
          currency: 'BTC',
          l1SwapAmount: btcFinalise.value.toString(),
        });
      } else {
        continue;
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
}, 5000); // Run every 5 seconds
