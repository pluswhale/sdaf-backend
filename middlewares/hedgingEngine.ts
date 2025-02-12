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
import {
  createFinaliseLog,
  createHedgineEngineLogWithOrderIdFromBinance,
  getFinaliseLogByTxId,
} from '../services/hedgineEngineHistoryLog';
import { ethers } from 'ethers';
import { BnbTransactionsInternalChecker } from '../services/hedger/BnbTransactionsInternalChecker';
import { BinancePlaceOrdersSwitcher } from '../services/hedger/BinancePlaceOrdersSwitcher';
import { findSuitableOrder } from '../services/findSuitableOrder';

dotenv.config();

const PROFIT_TRASHHOLD = 20;
const MARGIN_PERCENT = 1.1;

let isRunning = false;

async function hedgerMonitoringService(): Promise<boolean> {
  try {
    await sleep(1500);

    // Fetch finalise transactions concurrently
    let [finaliseUsdtTxs, finaliseBnbTxs, finaliseBtcTxs] = await Promise.all([
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
          const profitFromSwap = bnbOrdUsdtPrice - usdtFinalisePrice;
          console.log('BNB_OR_USDT_THRESHOLD', BNB_OR_USDT_THRESHOLD);
          console.log(
            'btcOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD',
            BNB_OR_USDT_THRESHOLD <= PROFIT_TRASHHOLD,
          );
          console.log('PRofit from swap: ', profitFromSwap);

          // condition to check if 10 minutes have passed
          const finaliseTxTimeStamp = +usdtFinalise?.timestamp;
          //@ts-ignore
          const receiveTxTimestamp = +bnbUsdtOrder?.timeStamp;
          const tenMinutesInSeconds = 10 * 60;
          const isTenMinsPassedAfterReceivingMoney = finaliseTxTimeStamp - receiveTxTimestamp >= tenMinutesInSeconds;

          if (isTenMinsPassedAfterReceivingMoney) {
            console.log('10 minutes have passed since transaction, recording in the database.');
            //@ts-ignore
            const { bestOrder } = await findSuitableOrder('BNBUSDT', 'SELL', 0);

            const heObjectForSavingInDb = await BinancePlaceOrdersSwitcher(
              'BNB',
              'USDT',
              bnbUsdtOrder,
              'SELL',
              ethers.formatUnits(bnbUsdtOrder?.value || '', 18),
              bestOrder,
              'targetWalletAddress',
              profitFromSwap,
              false,
            );
            console.log('heObjectForSavingInDb if 10 min last: ', heObjectForSavingInDb);
            await createHedgineEngineLogWithOrderIdFromBinance(heObjectForSavingInDb);

            return;
          }

          if (BNB_OR_USDT_THRESHOLD <= PROFIT_TRASHHOLD && !isTenMinsPassedAfterReceivingMoney) {
            await sleep(1000);
            const finaliseRow = await getFinaliseLogByTxId(bnbUsdtOrder?.hash);
            if (!finaliseRow) {
              const res = await placeOrderToBinanceResolver(bnbInternalOrdersToBeResolved, profitFromSwap, {
                symbol: 'BNB-USDT',
                direction: 'SELL',
              });

              bnbInternalOrdersToBeResolved.transactions = bnbInternalOrdersToBeResolved.transactions.filter(
                (t) => t.hash !== bnbUsdtOrder.hash,
              );

              if (res) {
                await createFinaliseLog({
                  txHash: usdtFinalise.hash,
                  currency: 'USDT',
                  l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
                });

                finaliseUsdtTxs = finaliseUsdtTxs.filter((fT) => fT?.hash !== usdtFinalise?.hash);
              }
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
          const profitFromSwap = bnbOrdUsdtPrice - usdtFinalisePrice;
          console.log('PRofit from swap: ', profitFromSwap);

          // condition to check if 10 minutes have passed
          //@ts-ignore
          // Convert timestamps to numbers
          const finaliseTxTimeStamp = Number(usdtFinalise?.timestamp) || 0;
          console.log('finaliseTxTimeStamp', finaliseTxTimeStamp);
          //@ts-ignore
          const receiveTxTimestamp = Number(bnbUsdtOrder?.timeStamp) || 0;
          console.log('receiveTxTimestamp', receiveTxTimestamp);
          const tenMinutesInSeconds = 10 * 60;

          const isTenMinsPassedAfterReceivingMoney = finaliseTxTimeStamp - receiveTxTimestamp >= tenMinutesInSeconds;

          console.log('isTenMinsPassedAfterReceivingMoney', isTenMinsPassedAfterReceivingMoney);

          if (isTenMinsPassedAfterReceivingMoney) {
            console.log('10 minutes have passed since transaction, recording in the database.');
            //@ts-ignore
            const { bestOrder } = await findSuitableOrder('BNBUSDT', 'SELL', 0);

            const heObjectForSavingInDb = await BinancePlaceOrdersSwitcher(
              'BNB',
              'USDT',
              bnbUsdtOrder,
              'SELL',
              ethers.formatUnits(bnbUsdtOrder?.value || '', 18),
              bestOrder,
              'targetWalletAddress',
              profitFromSwap,
              false,
            );
            console.log('heObjectForSavingInDb if 10 min last: ', heObjectForSavingInDb);
            await createHedgineEngineLogWithOrderIdFromBinance(heObjectForSavingInDb);

            return;
          }

          if (BNB_OR_USDT_THRESHOLD <= PROFIT_TRASHHOLD && !isTenMinsPassedAfterReceivingMoney) {
            await sleep(1000);
            const finaliseRow = await getFinaliseLogByTxId(bnbUsdtOrder?.hash);

            if (!finaliseRow) {
              const res = await placeOrderToBinanceResolver(bnbOrdersToBeResolved, profitFromSwap, {
                symbol: 'BNB-USDT',
                direction: 'SELL',
              });

              bnbOrdersToBeResolved.transactions = bnbOrdersToBeResolved.transactions.filter(
                (t) => t.hash !== bnbUsdtOrder.hash,
              );

              if (res) {
                await createFinaliseLog({
                  txHash: usdtFinalise.hash,
                  currency: 'USDT',
                  l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
                });

                finaliseUsdtTxs = finaliseUsdtTxs.filter((fT) => fT?.hash !== usdtFinalise?.hash);
              }
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
          const profitFromSwap = btcOrderPriceUsdt - usdtFinalisePrice;
          console.log('PRofit from swap: ', profitFromSwap);

          // condition to check if 10 minutes have passed
          const finaliseTxTimeStamp = +usdtFinalise?.timestamp;
          //@ts-ignore
          const receiveTxTimestamp = +btcOrder?.status?.block_time;
          const tenMinutesInSeconds = 10 * 60;
          const isTenMinsPassedAfterReceivingMoney = finaliseTxTimeStamp - receiveTxTimestamp >= tenMinutesInSeconds;

          if (isTenMinsPassedAfterReceivingMoney) {
            console.log('10 minutes have passed since transaction, recording in the database.');
            //@ts-ignore
            const { bestOrder } = await findSuitableOrder('BTCUSDT', 'SELL', 0);

            const heObjectForSavingInDb = await BinancePlaceOrdersSwitcher(
              'BTC',
              'USDT',
              btcOrder,
              'SELL',
              btcOrder.value, //amount
              bestOrder,
              'targetWalletAddress',
              profitFromSwap,
              false,
            );
            console.log('heObjectForSavingInDb if 10 min last: ', heObjectForSavingInDb);
            await createHedgineEngineLogWithOrderIdFromBinance(heObjectForSavingInDb);

            return;
          }

          if (BTC_THRESHOLD <= PROFIT_TRASHHOLD && !isTenMinsPassedAfterReceivingMoney) {
            await sleep(1000);
            const finaliseRow = await getFinaliseLogByTxId(btcOrder?.txid);

            if (!finaliseRow) {
              const res = await placeOrderToBinanceResolver(btcOrdersNeedToBeResolved, profitFromSwap, {
                symbol: 'BTC-USDT',
                direction: 'SELL',
              });

              btcOrdersNeedToBeResolved.transactions = btcOrdersNeedToBeResolved.transactions.filter(
                (t) => t.txid !== btcOrder.txid,
              );
              if (res) {
                await createFinaliseLog({
                  txHash: usdtFinalise.hash,
                  currency: 'USDT',
                  l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
                });

                finaliseUsdtTxs = finaliseUsdtTxs.filter((fT) => fT?.hash !== usdtFinalise?.hash);
              }
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

        const bnbPromises = finaliseBnbTxs.map(async (bnbFinalise) => {
          const bnbFinalisePrice = +ethers.formatUnits(bnbFinalise.value, 18) * prices?.data?.prices?.BNB;
          console.log('bnbFinalisePrice', bnbFinalisePrice);
          console.log('usdrOrderPrice', usdrOrderPrice);
          const BNB_THRESHOLD = (Math.abs(usdrOrderPrice - bnbFinalisePrice) / usdrOrderPrice) * 100;
          console.log('BNB_THRESHOLD', BNB_THRESHOLD);
          console.log('bnbOrderPriceUsdt - usdtFinalisePrice <= PROFIT_TRASHHOLD', BNB_THRESHOLD <= PROFIT_TRASHHOLD);

          const profitFromSwap = usdrOrderPrice - bnbFinalisePrice;
          console.log('PRofit from swap: ', profitFromSwap);

          // condition to check if 10 minutes have passed
          const finaliseTxTimeStamp = +bnbFinalise?.timestamp;
          const receiveTxTimestamp = +usdtOrder?.timeStamp;
          const tenMinutesInSeconds = 10 * 60;
          const isTenMinsPassedAfterReceivingMoney = finaliseTxTimeStamp - receiveTxTimestamp >= tenMinutesInSeconds;

          if (isTenMinsPassedAfterReceivingMoney) {
            console.log('10 minutes have passed since transaction, recording in the database.');
            //@ts-ignore
            const { bestOrder } = await findSuitableOrder('BNBUSDT', 'BUY', 0);

            const heObjectForSavingInDb = await BinancePlaceOrdersSwitcher(
              'BNB',
              'USDT',
              usdtOrder,
              'BUY',
              +ethers.formatUnits(usdtOrder.value, 18) / +bestOrder?.[0], // amount
              bestOrder,
              'targetWalletAddress',
              profitFromSwap,
              false,
            );
            console.log('heObjectForSavingInDb if 10 min last: ', heObjectForSavingInDb);
            await createHedgineEngineLogWithOrderIdFromBinance(heObjectForSavingInDb);

            return;
          }

          if (BNB_THRESHOLD <= PROFIT_TRASHHOLD) {
            await sleep(1000);
            const finaliseRow = await getFinaliseLogByTxId(usdtOrder?.hash);

            if (!finaliseRow) {
              const res = await placeOrderToBinanceResolver(usdtBnbAndBtcOrdersNeedToBeResolved, profitFromSwap, {
                symbol: 'BNB-USDT',
                direction: 'BUY',
              });

              usdtBnbAndBtcOrdersNeedToBeResolved.transactions =
                usdtBnbAndBtcOrdersNeedToBeResolved?.transactions?.filter((t) => t.hash !== usdtOrder.hash);

              if (res) {
                await createFinaliseLog({
                  txHash: bnbFinalise.hash,
                  currency: 'BNB',
                  l1SwapAmount: ethers.formatUnits(bnbFinalise.value, 18).toString(),
                });

                finaliseBnbTxs = finaliseBnbTxs.filter((fT) => fT?.hash !== bnbFinalise?.hash);
              }
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
          const profitFromSwap = usdrOrderPrice - btcFinalisePrice;
          console.log('PRofit from swap: ', profitFromSwap);

          // condition to check if 10 minutes have passed
          const finaliseTxTimeStamp = +btcFinalise?.status?.block_time || Math.floor(Date.now() / 1000);
          const receiveTxTimestamp = +usdtOrder?.timeStamp;
          const tenMinutesInSeconds = 10 * 60;
          const isTenMinsPassedAfterReceivingMoney = finaliseTxTimeStamp - receiveTxTimestamp >= tenMinutesInSeconds;

          if (isTenMinsPassedAfterReceivingMoney) {
            console.log('10 minutes have passed since transaction, recording in the database.');
            //@ts-ignore
            const { bestOrder } = await findSuitableOrder('BTCUSDT', 'BUY', 0);

            const heObjectForSavingInDb = await BinancePlaceOrdersSwitcher(
              'BTC',
              'USDT',
              usdtOrder,
              'BUY',
              +ethers.formatUnits(usdtOrder.value, 18) / +bestOrder?.[0], // amount
              bestOrder,
              'targetWalletAddress',
              profitFromSwap,
              false,
            );
            console.log('heObjectForSavingInDb if 10 min last: ', heObjectForSavingInDb);
            await createHedgineEngineLogWithOrderIdFromBinance(heObjectForSavingInDb);

            return;
          }

          if (BTC_THRESHOLD <= PROFIT_TRASHHOLD && !isTenMinsPassedAfterReceivingMoney) {
            await sleep(1000);
            const finaliseRow = await getFinaliseLogByTxId(usdtOrder?.hash);

            if (!finaliseRow) {
              const res = await placeOrderToBinanceResolver(usdtBnbAndBtcOrdersNeedToBeResolved, profitFromSwap, {
                symbol: 'BTC-USDT',
                direction: 'BUY',
              });

              usdtBnbAndBtcOrdersNeedToBeResolved.transactions =
                usdtBnbAndBtcOrdersNeedToBeResolved.transactions.filter((t) => t.hash !== usdtOrder.hash);
              if (res) {
                await createFinaliseLog({
                  txHash: btcFinalise.txid,
                  currency: 'BTC',
                  l1SwapAmount: btcFinalise.value.toString(),
                });

                finaliseBtcTxs = finaliseBtcTxs.filter((fT) => fT?.txid !== btcFinalise?.txid);
              }
            }
          }
        });

        await Promise.all([...bnbPromises, ...btcPromises]);
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
