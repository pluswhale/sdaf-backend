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
import { BnbTransactionsInternalChecker } from '../services/hedger/BnbTransactionsInternalChecker';

dotenv.config();

const PROFIT_TRASHHOLD = 20;
const MARGIN_PERCENT = 1.1;

let isRunning = false;

async function hedgerMonitoringService(): Promise<boolean> {
  try {
    await sleep(1500);

    // Fetch finalise transactions concurrently
    const [finaliseUsdtTxs, finaliseBnbTxs, finaliseBtcTxs] = await Promise.all([
      UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_bnb.walletAddress),
      BnbTransactionsFinaliseChecker(FINALISE_WALLETS.bnb_usdt.walletAddress),
      BtcTransactionsFinaliseChecker(FINALISE_WALLETS.btc_usdt.walletAddress),
    ]);

    console.log('BTC Finalisers', finaliseBtcTxs?.length);
    console.log('BNB Finalisers', finaliseBnbTxs?.length);
    console.log('USDT Finalisers', finaliseUsdtTxs?.length);
    // Fetch unresolved transactions concurrently
    const [
      usdtBnbAndBtcOrdersNeedToBeResolved,
      bnbInternalOrdersToBeResolved,
      bnbOrdersToBeResolved,
      btcOrdersNeedToBeResolved,
    ] = await Promise.all([
      UsdtTransactionsChecker(
        RECEIVER_WALLETS.usdt_bnb.walletAddress,
        RECEIVER_WALLETS.usdt_bnb.symbol,
        RECEIVER_WALLETS.usdt_bnb.direction,
      ),
      BnbTransactionsInternalChecker(
        RECEIVER_WALLETS.bnb_usdt.walletAddress,
        RECEIVER_WALLETS.bnb_usdt.symbol,
        RECEIVER_WALLETS.bnb_usdt.direction,
      ),
      BnbTransactionsChecker(
        RECEIVER_WALLETS.bnb_usdt.walletAddress,
        RECEIVER_WALLETS.bnb_usdt.symbol,
        RECEIVER_WALLETS.bnb_usdt.direction,
      ),
      BtcTransactionsChecker(
        RECEIVER_WALLETS.btc_usdt.walletAddress,
        RECEIVER_WALLETS.btc_usdt.symbol,
        RECEIVER_WALLETS.btc_usdt.direction,
      ),
    ]);

    await sleep(1000);
    const prices = await axios.get('https://sdafcwap.com/app/api/get-asset-price');

    console.log('bnbOrdersToBeResolved', bnbOrdersToBeResolved?.transactions?.length);
    // For INTERNAL BNB orders
    if (bnbInternalOrdersToBeResolved) {
      for (let bnbUsdtOrder of bnbInternalOrdersToBeResolved.transactions) {
        console.log('bnb order value', +bnbUsdtOrder?.value);
        console.log('+prices?.data?.bnb', +prices?.data?.prices?.BNB);
        const bnbOrdUsdtPrice = +ethers.formatUnits(bnbUsdtOrder.value) * +prices?.data?.prices?.BNB;
        console.log('bnbOrdUsdtPrice', bnbOrdUsdtPrice);

        const bnbPromises = finaliseUsdtTxs.map(async (usdtFinalise) => {
          const usdtFinalisePrice = +ethers.formatUnits(usdtFinalise.value, 18);
          console.log('usdtFinalisePrice', usdtFinalisePrice);
          console.log('bnbOrdUsdtPrice', bnbOrdUsdtPrice);
          const BNB_OR_USDT_THRESHOLD = (Math.abs(bnbOrdUsdtPrice - usdtFinalisePrice) / bnbOrdUsdtPrice) * 100;
          console.log('BNB_OR_USDT_THRESHOLD', BNB_OR_USDT_THRESHOLD);
          console.log(
            'btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD',
            BNB_OR_USDT_THRESHOLD <= PROFIT_TRASHHOLD,
          );
          if (BNB_OR_USDT_THRESHOLD <= PROFIT_TRASHHOLD) {
            const res = await placeOrderToBinanceResolver(
              bnbInternalOrdersToBeResolved,
              bnbOrdUsdtPrice - usdtFinalisePrice,
              {
                symbol: 'BNB-USDT',
                direction: 'SELL',
              },
            );

            if (res) {
              await createFinaliseLog({
                txHash: usdtFinalise.hash,
                currency: 'USDT',
                l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
              });
            }
          }
        });

        await Promise.all(bnbPromises); // Wait for all the order placements
      }
    }
    // For BNB orders
    if (bnbOrdersToBeResolved) {
      for (let bnbUsdtOrder of bnbOrdersToBeResolved.transactions) {
        console.log('bnb order value', +bnbUsdtOrder?.value);
        console.log('+prices?.data?.bnb', +prices?.data?.prices?.BNB);
        const bnbOrdUsdtPrice = +ethers.formatUnits(bnbUsdtOrder.value) * +prices?.data?.prices?.BNB;
        console.log('bnbOrdUsdtPrice', bnbOrdUsdtPrice);

        const bnbPromises = finaliseUsdtTxs.map(async (usdtFinalise) => {
          const usdtFinalisePrice = +ethers.formatUnits(usdtFinalise.value, 18);
          console.log('usdtFinalisePrice', usdtFinalisePrice);
          console.log('bnbOrdUsdtPrice', bnbOrdUsdtPrice);
          const BNB_OR_USDT_THRESHOLD = (Math.abs(bnbOrdUsdtPrice - usdtFinalisePrice) / bnbOrdUsdtPrice) * 100;
          console.log('BNB_OR_USDT_THRESHOLD', BNB_OR_USDT_THRESHOLD);
          console.log(
            'btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD',
            BNB_OR_USDT_THRESHOLD <= PROFIT_TRASHHOLD,
          );
          if (BNB_OR_USDT_THRESHOLD <= PROFIT_TRASHHOLD) {
            const res = await placeOrderToBinanceResolver(bnbOrdersToBeResolved, bnbOrdUsdtPrice - usdtFinalisePrice, {
              symbol: 'BNB-USDT',
              direction: 'SELL',
            });

            if (res) {
              await createFinaliseLog({
                txHash: usdtFinalise.hash,
                currency: 'USDT',
                l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
              });
            }
          }
        });

        await Promise.all(bnbPromises); // Wait for all the order placements
      }
    }

    console.log('btcOrdersNeedToBeResolved?.transactions?.length', btcOrdersNeedToBeResolved?.transactions?.length);

    console.log('btcOrdersNeedToBeResolved', btcOrdersNeedToBeResolved?.transactions);
    // For BTC orders
    if (btcOrdersNeedToBeResolved?.transactions?.length) {
      for (let btcOrder of btcOrdersNeedToBeResolved.transactions) {
        console.log('btc order value', +btcOrder?.value);
        console.log('+prices?.data?.BTC', +prices?.data?.prices?.BTC);
        const btcOrderPriceUsdt = +btcOrder.value * +prices?.data?.prices?.BTC;
        console.log('btcOrderPriceUsdt', btcOrderPriceUsdt);
        const btcOrderPromises = finaliseUsdtTxs.map(async (usdtFinalise) => {
          const usdtFinalisePrice = +ethers.formatUnits(usdtFinalise.value, 18);
          console.log('usdtFinalisePrice', usdtFinalisePrice);
          const BTC_THRESHOLD = (Math.abs(btcOrderPriceUsdt - usdtFinalisePrice) / btcOrderPriceUsdt) * 100;
          console.log('BNB_THRESHOLD', BTC_THRESHOLD);
          console.log('btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD', BTC_THRESHOLD <= PROFIT_TRASHHOLD);
          if (BTC_THRESHOLD <= PROFIT_TRASHHOLD) {
            const res = await placeOrderToBinanceResolver(
              btcOrdersNeedToBeResolved,
              btcOrderPriceUsdt - usdtFinalisePrice,
              { symbol: 'BTC-USDT', direction: 'SELL' },
            );
            if (res) {
              await createFinaliseLog({
                txHash: usdtFinalise.hash,
                currency: 'USDT',
                l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
              });
            }
          }
        });

        await Promise.all(btcOrderPromises); // Wait for all the order placements
      }
    }

    console.log('usdtBnbAndBtcOrdersNeedToBeResolved', usdtBnbAndBtcOrdersNeedToBeResolved?.transactions?.length);

    // For USDT orders
    if (usdtBnbAndBtcOrdersNeedToBeResolved?.transactions?.length) {
      for (let usdtOrder of usdtBnbAndBtcOrdersNeedToBeResolved.transactions) {
        console.log('usdtOrder', usdtOrder);
        const usdrOrderPrice = +ethers.formatUnits(usdtOrder.value);

        const usdtPromises = finaliseBnbTxs.map(async (bnbFinalise) => {
          const bnbFinalisePrice = +ethers.formatUnits(bnbFinalise.value, 18) * prices?.data?.prices?.BNB;
          console.log('bnbFinalisePrice', bnbFinalisePrice);
          console.log('usdrOrderPrice', usdrOrderPrice);
          const BNB_THRESHOLD = (Math.abs(usdrOrderPrice - bnbFinalisePrice) / usdrOrderPrice) * 100;
          console.log('BNB_THRESHOLD', BNB_THRESHOLD);
          console.log('bnbOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD', BNB_THRESHOLD <= PROFIT_TRASHHOLD);
          if (BNB_THRESHOLD <= PROFIT_TRASHHOLD) {
            const res = await placeOrderToBinanceResolver(
              usdtBnbAndBtcOrdersNeedToBeResolved,
              usdrOrderPrice - bnbFinalisePrice,
              { symbol: 'BNB-USDT', direction: 'BUY' },
            );
            if (res) {
              await createFinaliseLog({
                txHash: bnbFinalise.hash,
                currency: 'BNB',
                l1SwapAmount: ethers.formatUnits(bnbFinalise.value, 18).toString(),
              });
            }
          }
        });

        const btcPromises = finaliseBtcTxs.map(async (btcFinalise) => {
          const btcFinalisePrice = +btcFinalise.value * prices?.data?.prices?.BTC;
          console.log('btcFinalisePrice', btcFinalisePrice);
          console.log('usdrOrderPrice', usdrOrderPrice);
          const BTC_THRESHOLD = (Math.abs(usdrOrderPrice - btcFinalisePrice) / usdrOrderPrice) * 100;
          console.log('BTC_THRESHOLD', BTC_THRESHOLD);
          console.log('btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD', BTC_THRESHOLD <= PROFIT_TRASHHOLD);
          if (BTC_THRESHOLD <= PROFIT_TRASHHOLD) {
            const res = await placeOrderToBinanceResolver(
              usdtBnbAndBtcOrdersNeedToBeResolved,
              usdrOrderPrice - btcFinalisePrice,
              { symbol: 'BTC-USDT', direction: 'BUY' },
            );
            if (res) {
              await createFinaliseLog({
                txHash: btcFinalise.txid,
                currency: 'BTC',
                l1SwapAmount: btcFinalise.value.toString(),
              });
            }
          }
        });

        await Promise.all([...usdtPromises, ...btcPromises]);
      }
    }

    return true;
  } catch (e) {
    console.log('he log error:', e);
    return true;
  }
}

const runHedgerMonitoring = async () => {
  try {
    console.log('Starting scheduled tasks: get Confirmations and Initiate Binance Buy/Sell');
    await hedgerMonitoringService();
    console.log('Scheduled tasks completed successfully.');
  } catch (error) {
    console.error('Error during scheduled tasks:', error);
  }
};

setInterval(async () => {
  await runHedgerMonitoring();
}, 30000);
