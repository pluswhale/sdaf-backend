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
import { BtcTransactionsFinaliseCheckerNoDbSave } from '../services/hedger/BtcTransactionsFinalizeCheckerNoDbSave';
import { BnbTransactionsFinaliseCheckerNoDbSave } from '../services/hedger/BnbTransactionsFinalizeCheckerNoDbSave';
import { createFinaliseLog } from '../services/hedgineEngineHistoryLog';

dotenv.config();

const ALLOWED_THRESHOLD = 0.2;

let isRunning = false;

async function hedgerMonitoringService(): Promise<void> {
  const usdtOrdersNeedToBeResolved = await UsdtTransactionsChecker(
    RECEIVER_WALLETS.usdt_bnb.walletAddress,
    RECEIVER_WALLETS.usdt_bnb.symbol,
    RECEIVER_WALLETS.usdt_bnb.direction,
  );

    // Fetch finalise transactions concurrently
    const [finaliseUsdtTxs, finaliseBnbTxs] = await Promise.all([
      UsdtTransactionsFinaliseChecker(FINALISE_WALLETS.usdt_bnb.walletAddress),
      BnbTransactionsFinaliseChecker(FINALISE_WALLETS.bnb_usdt.walletAddress),
    ]);

  const bnbOrdersToBeResolved = await BnbTransactionsChecker(
    RECEIVER_WALLETS.bnb_usdt.walletAddress,
    RECEIVER_WALLETS.bnb_usdt.symbol,
    RECEIVER_WALLETS.bnb_usdt.direction,
  );

    await sleep(1000);
    const prices = await axios.get('https://sdafcwap.com/app/api/get-asset-price');

    console.log('bnbOrdersToBeResolved', bnbOrdersToBeResolved?.transactions?.length);
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
            const res = await placeOrderToBinanceResolver(bnbOrdersToBeResolved, bnbOrdUsdtPrice - usdtFinalisePrice, {symbol: 'BNB-USDT', direction: 'SELL'});
            if (res) {
              await createFinaliseLog({
                txHash: usdtFinalise.hash,
                currency: 'USDT',
                l1SwapAmount: ethers.formatUnits(usdtFinalise.value, 18).toString(),
              });
            }
          }
        });

  if (usdtOrdersNeedToBeResolved) {
    const prices = await axios.get('https://sdafcwap.com/app/api/get-asset-price');
    const btcFinalizerTxs = await BtcTransactionsFinaliseCheckerNoDbSave(FINALISE_WALLETS.btc_usdt.walletAddress);
    console.log('btcFinalizerTxs: ', btcFinalizerTxs);
    const bnbFinalizerTxs = await BnbTransactionsFinaliseCheckerNoDbSave(FINALISE_WALLETS.bnb_usdt.walletAddress);
    console.log('bnbFinalizerTxs: ', bnbFinalizerTxs);

    if(usdtOrdersNeedToBeResolved.transactions && usdtOrdersNeedToBeResolved.transactions.length > 0) {
      for(let usdtTx of usdtOrdersNeedToBeResolved.transactions) {
        if(btcFinalizerTxs && btcFinalizerTxs.length > 0) {
          for(let btcFinalizeTx of btcFinalizerTxs) {
            const BTC_THRESHOLD = Math.abs(Number(ethers.formatUnits(usdtTx.value, 18)) - (btcFinalizeTx.vin[0].prevout.value / 1e8) * prices.data.BTC)/(Number(ethers.formatUnits(usdtTx.value, 18)))
            console.log(BTC_THRESHOLD)
            if(usdtTx.timeStamp > btcFinalizeTx.status.block_time && BTC_THRESHOLD <= ALLOWED_THRESHOLD ) {
              await placeOrderToBinanceResolver({ symbol: 'BTC-USDT', direction: 'BUY', transactions: usdtOrdersNeedToBeResolved.transactions})
              const amountInBtc = btcFinalizeTx.vin
              .filter((input: any) => input?.prevout?.scriptpubkey_address === FINALISE_WALLETS.btc_usdt.walletAddress)
              .reduce((sum: number, input: any) => sum + input.prevout.value, 0) / 1e8

              await createFinaliseLog({
                txHash: btcFinalizeTx.txid,
                currency: 'BTC',
                l1SwapAmount: amountInBtc.toString(),
              });
            }
          }
        }

        if(bnbFinalizerTxs && bnbFinalizerTxs.length > 0) {
          for(let bnbFinalizeTx of bnbFinalizerTxs) {
            const BNB_THRESHOLD = Math.abs(Number(ethers.formatUnits(usdtTx.value, 18)) - Number(ethers.formatUnits(bnbFinalizeTx.value, 18)) * prices.data.BNB)/(Number(ethers.formatUnits(usdtTx.value, 18)))
            if(usdtTx.timeStamp > bnbFinalizeTx.timestamp && BNB_THRESHOLD  <= ALLOWED_THRESHOLD ) {
              await placeOrderToBinanceResolver({ symbol: 'BNB-USDT', direction: 'BUY', transactions: usdtOrdersNeedToBeResolved.transactions})
              await createFinaliseLog({
                txHash: bnbFinalizeTx.hash,
                currency: 'BNB',
                l1SwapAmount: String(ethers.formatUnits(bnbFinalizeTx.value, 18)),
              });
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
              {symbol: 'BNB-USDT', direction: 'BUY'}
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
              {symbol: 'BTC-USDT', direction: 'BUY'}
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
}, 30000); // Run every 30 seconds
