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

import axios from 'axios';
import { createFinaliseLog } from '../services/hedgineEngineHistoryLog';
import { ethers } from 'ethers';

dotenv.config();



const PROFIT_TRASHHOLD = 5;
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

  // const bnbInternalOrdersToBeResolved = await BnbTransactionsInternalChecker(
  //   RECEIVER_WALLETS.bnb_usdt.walletAddress,
  //   RECEIVER_WALLETS.bnb_usdt.symbol,
  //   RECEIVER_WALLETS.bnb_usdt.direction,
  // );


  const btcOrdersNeedToBeResolved = await BtcTransactionsChecker(
    RECEIVER_WALLETS.btc_usdt.walletAddress,
    RECEIVER_WALLETS.btc_usdt.symbol,
    RECEIVER_WALLETS.btc_usdt.direction,
  );


  const finaliseUsdtTxs = await UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_bnb.walletAddress);
  const finaliseBnbTxs = await BnbTransactionsFinaliseChecker(FINALISE_WALLETS.bnb_usdt.walletAddress);
  const finaliseBtcTxs = await BtcTransactionsFinaliseChecker(FINALISE_WALLETS.btc_usdt.walletAddress);
await sleep(1000);
  const prices = await axios.get('https://sdafcwap.com/app/api/get-asset-price');

  console.log('btcOrdersNeedToBeResolved?.transactions?.length', btcOrdersNeedToBeResolved?.transactions?.length);
  // For BTC
  if (btcOrdersNeedToBeResolved?.transactions?.length) {
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

          await createFinaliseLog({
            txHash: usdtFinalise.hash,
            currency: 'USDT',
            l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
          });

        } else {

        }
      }
    }
  }

  console.log('usdtBnbAndBtcOrdersNeedToBeResolved', usdtBnbAndBtcOrdersNeedToBeResolved?.transactions?.length);

  //For USDT
  if (usdtBnbAndBtcOrdersNeedToBeResolved?.transactions?.length) {
    for (let usdtOrder of usdtBnbAndBtcOrdersNeedToBeResolved.transactions) {

      console.log('usdtOrder', usdtOrder);
      const usdrOrderPrice = +ethers.formatUnits(usdtOrder.value);

      for (let bnbFinalise of finaliseBnbTxs) {
        const bnbFinalisePrice = (+ethers.formatUnits(bnbFinalise.value, 18) * prices?.data?.prices?.BNB) * MARGIN_PERCENT;
        console.log('bnbFinalisePrice', bnbFinalisePrice);
        console.log('usdrOrderPrice', usdrOrderPrice);
        console.log('btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD', usdrOrderPrice - bnbFinalisePrice <= PROFIT_TRASHHOLD);
        if (usdrOrderPrice - bnbFinalisePrice <= PROFIT_TRASHHOLD) {

          await placeOrderToBinanceResolver(usdtBnbAndBtcOrdersNeedToBeResolved);

          await createFinaliseLog({
            txHash: bnbFinalise.hash,
            currency: 'BNB',
            l1SwapAmount: ethers.formatUnits(bnbFinalise.value, 18).toString(),
          });

        } else {

        }
      }

      for (let btcFinalise of finaliseBtcTxs) {
        const btcFinalisePrice = (+btcFinalise.value * prices?.data?.prices?.BNB) * MARGIN_PERCENT;
        console.log('btcFinalisePrice', btcFinalisePrice);
        console.log('usdrOrderPrice', usdrOrderPrice);
        console.log('btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD', usdrOrderPrice - btcFinalisePrice <= PROFIT_TRASHHOLD);
        if (usdrOrderPrice - btcFinalisePrice <= PROFIT_TRASHHOLD) {
          await placeOrderToBinanceResolver(usdtBnbAndBtcOrdersNeedToBeResolved);

          await createFinaliseLog({
            txHash: btcFinalise.txid,
            currency: 'BTC',
            l1SwapAmount: btcFinalise.value.toString(),
          });

        } else {

        }
      }
    }
  }


  console.log('bnbOrdersToBeResolved', bnbOrdersToBeResolved?.transactions?.length);
  //For BNB
  if (bnbOrdersToBeResolved) {
    for (let bnbUsdtOrder of bnbOrdersToBeResolved.transactions) {
      console.log('bnb order value', +bnbUsdtOrder?.value);
      console.log('+prices?.data?.bnb', +prices?.data?.prices?.BNB);
      const bnbOrdUsdtPrice = +ethers.formatUnits(bnbUsdtOrder.value)  * +prices?.data?.prices?.BNB;
      console.log('bnbOrdUsdtPrice', bnbOrdUsdtPrice);

      console.log('finaliseUsdtTx', finaliseUsdtTxs);
      for (let usdtFinalise of finaliseUsdtTxs) {
        const usdtFinalisePrice = +ethers.formatUnits(usdtFinalise.value, 18) * MARGIN_PERCENT;
        console.log('usdtFinalisePrice', usdtFinalisePrice);
        console.log('bnbOrdUsdtPrice', bnbOrdUsdtPrice);
        console.log('btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD', bnbOrdUsdtPrice - usdtFinalisePrice <= PROFIT_TRASHHOLD);
        if (bnbOrdUsdtPrice - usdtFinalisePrice <= PROFIT_TRASHHOLD) {
          await placeOrderToBinanceResolver(bnbOrdersToBeResolved);

          await createFinaliseLog({
            txHash: usdtFinalise.hash,
            currency: 'USDT',
            l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
          });

        } else {

        }
      }
    }
  }

}

setInterval(async () => {

  try {
    console.log('Starting scheduled tasks: get Confirmations and Initiate Binance Buy/Sell');
    await hedgerMonitoringService();

    console.log('Scheduled tasks completed successfully.');
  } catch (error) {
    console.error('Error during scheduled tasks:', error);
  }
}, 30000); // Run every 5 seconds
