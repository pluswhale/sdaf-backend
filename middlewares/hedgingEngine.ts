import * as cron from 'node-cron';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import { AppDataSource } from '../db/AppDataSource';
import Binance from 'binance-api-node';
import { ethers, Wallet } from 'ethers';
import { placeBinanceOrder } from '../services/binanceTrade';
import { HedgineEngineLog } from '../db/entities/HedgineEngineLog';

import { Direction, findSuitableOrder } from '../services/findSuitableOrder';
import {
  createHedgineEngineLogWithOrderIdFromBinance,
  getHedgineEngineHistoryLogByTxId,
} from '../services/hedgineEngineHistoryLog';

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_KEY,
});

const hedgingEngineLogRepo = AppDataSource.getRepository(HedgineEngineLog);

let isRunning = false;

// Replace with your private key
const privateKey = '0x9f27be65bac3a082b74e7c8e00a73d14abffedcbcb847f59a4fd75a984af25ce';
const wallet = new Wallet(privateKey);
const publicAddress = wallet.address;

const BSC_SCAN_API_KEY = 'WTYZJUZD5RC99WNUAFTIMSII927UYCRG6G';
const address = publicAddress; // Use the derived address
// const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API_KEY}`; //url for normal transactions. bnb transactions for cwap are considered internal

const heGeneratedLogOjbect = {} as {
  pairSwapDirectionOnSwap?: string;
  l1SwapAmount?: string;
  l2SwapAmount?: string;
  orderTypeOnBinance?: string;
  priceSettledToUser?: string;
  priceHedgedOnBinance?: string;
  marginValue?: string;
  profitFromSwap?: string;
};

async function fetchTransactions() {
  try {
    // const response = await axios.get(url);
    const response = await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action: 'txlistinternal',
        address: address,
        startblock: 0,
        endblock: 999999999,
        page: 1,
        offset: 10,
        sort: 'desc',
        apiKey: BSC_SCAN_API_KEY,
      },
    });
    const usdtTransfers = await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: '0x55d398326f99059fF775485246999027B3197955',
        address: address,
        startblock: 0,
        endblock: 999999999,
        page: 1,
        offset: 10,
        sort: 'desc',
        apiKey: BSC_SCAN_API_KEY,
      },
    });
    const transactions = response.data.result.concat(usdtTransfers.data.result);

    if (transactions && transactions.length) {
      return transactions;
    } else {
      console.log('No transactions found for this address.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

let isEnded = true;

async function monitorWallet(): Promise<void> {
  const transactions = await fetchTransactions();
  isEnded = false;

  if (transactions) {
    for (let transaction of transactions) {
      const heHistoryLog = await getHedgineEngineHistoryLogByTxId(transaction.hash);

      if (heHistoryLog) {
        continue;
      }

      try {
        const isBnb = !transaction.tokenName;
        console.log('isBNB: ', isBnb);
        const fromCoin = isBnb ? 'BNB' : 'USDT';
        const toCoin = isBnb ? 'USDT' : 'BNB';
        const quoteToGetBnbPrice = await findSuitableOrder(fromCoin, toCoin, 0);
        const amount = isBnb
          ? ethers.formatUnits(transaction.value, 18)
          : //@ts-ignore
            +ethers.formatUnits(transaction.value, 18) / +quoteToGetBnbPrice?.bestOrder?.[0];
        console.log('amount in native', ethers.formatUnits(transaction.value, 18));
        console.log('amount: ', amount);

        if (!isEnded) {
          console.log(`Initiating Binance order for ${amount} ${fromCoin} to ${toCoin}.`);
          //@ts-ignore
          const { direction, symbol, amount: quantity, bestOrder } = await findSuitableOrder(fromCoin, toCoin, +amount);
          console.log(direction, symbol, quantity, bestOrder);
          //@ts-ignore
          const result = await placeBinanceOrder(bestOrder?.[0], quantity, symbol, direction);

          console.log('!!!!!!!!!!!!!!!!!!!!------------ result', result);

          if (result) {
            heGeneratedLogOjbect.l1SwapAmount =
              String(ethers.formatUnits(transaction.value, 18)) +
              `${fromCoin.includes('USDT') ? ' USDT' : ' ' + fromCoin}`;
            heGeneratedLogOjbect.l2SwapAmount =
              `${
                direction === Direction.BUY
                  ? String(+ethers.formatUnits(transaction.value, 18) / bestOrder?.[0])
                  : String(+ethers.formatUnits(transaction.value, 18) * bestOrder?.[0])
              }` + `${toCoin.includes('USDT') ? ' USDT' : ' ' + toCoin}`;
            heGeneratedLogOjbect.pairSwapDirectionOnSwap = fromCoin + ' ' + toCoin;
            heGeneratedLogOjbect.orderTypeOnBinance = direction;
            heGeneratedLogOjbect.priceSettledToUser =
              direction === Direction.SELL ? +bestOrder?.[0] * 0.95 + ' USDT' : +bestOrder?.[0] * 1.05 + ' USDT'; //needs to come from bot
            heGeneratedLogOjbect.priceHedgedOnBinance = bestOrder?.[0] + ' USDT';
            heGeneratedLogOjbect.marginValue = '5';

            // Calculate profit margin using quantity
            const priceHedgedOnBinanceValue = parseFloat(
              heGeneratedLogOjbect.priceHedgedOnBinance.replace(' USDT', ''),
            );
            const priceSettledToUserValue = parseFloat(heGeneratedLogOjbect.priceSettledToUser.replace(' USDT', ''));
            const marginValuePercentage = parseFloat(heGeneratedLogOjbect.marginValue) / 100;

            // const adjustedPrice = priceHedgedOnBinanceValue * (1 + marginValuePercentage);
            const profitFromSwap = Math.abs(quantity * priceHedgedOnBinanceValue - quantity * priceSettledToUserValue);

            heGeneratedLogOjbect.profitFromSwap = profitFromSwap + ' USDT';

            console.log('!!!!!!!!!!!!!!!---------------heGeneratedLogOjbect VALUES:  ', heGeneratedLogOjbect);

            const createdLog = await createHedgineEngineLogWithOrderIdFromBinance(
              transaction.hash,
              heGeneratedLogOjbect,
            );

            console.log('!!!!!!!!!!!!!!!!!!!!------------ createdLog?.txHash', createdLog?.txHash);

            //  if (createdLog?.txHash) {

            //   console.log('!!!!!!!!!!!!!!!---------------heGeneratedLogOjbect VALUES:  ', heGeneratedLogOjbect);

            //    await  editHedgineEngineHistoryLog(createdLog.txHash, heGeneratedLogOjbect);
            //  }
          }
        }
      } catch (error) {
        console.error('Error processing confirmed transaction:', error);
      }
    }
  }
}

dotenv.config();

const mapToSymbol = {
  BNBUSDT: 'BNBUSDT',
  USDTBNB: 'BNBUSDT',
  BTCUSDT: 'BTCUSDT',
  USDTBTC: 'BTCUSDT',
};

// async function placeBinanceOrderAndEnsureFulfillment(fromCoin: string, toCoin: string, amount: string): Promise<void> {
//   //@ts-ignore
//   const symbol = mapToSymbol[`${fromCoin}${toCoin}`];
//   const side = symbol === `${fromCoin}${toCoin}` ? 'SELL' : 'BUY';
//   const quantity = amount;

//   let orderFulfilled = false;

//   while (!orderFulfilled) {
//     try {
//       // Place a limit order
//       const order = await client.order({
//         symbol,
//         side,
//         type: OrderType.LIMIT,
//         price: '300', // Dynamically compute this price as needed
//         quantity: quantity,
//         timeInForce: 'GTC',
//       });

//       console.log(`Limit order placed. Order ID: ${order.orderId}`);

//       // Check the order status
//       const maxRetries = 2; // Limit retries to avoid infinite loops
//       let retries = 0;

//       while (retries < maxRetries) {
//         //@ts-ignore
//         const orderStatus = await checkOrderStatus(order.orderId, fromCoin, toCoin);

//         //@ts-ignore
//         if (orderStatus.status === 'FILLED') {
//           console.log(`Order ${order.orderId} has been fulfilled.`);
//           orderFulfilled = true;
//           break;
//         }

//         console.log(`Order ${order.orderId} not fulfilled yet. Retrying in 5 seconds...`);
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         retries++;
//       }

//       if (!orderFulfilled) {
//         console.log(`Order ${order.orderId} was not fulfilled after ${maxRetries} retries. Recreating order.`);
//         // Cancel the unfulfilled order before retrying
//         await client.cancelOrder({
//           symbol,
//           orderId: order.orderId,
//         });
//       }
//     } catch (error) {
//       console.error('Error placing or checking Binance order:', error);
//     }
//   }
// }

async function checkOrderStatus(orderId: string, fromCoin: string, toCoin: string): Promise<any> {
  //@ts-ignore
  const symbol = mapToSymbol[`${fromCoin}${toCoin}`];

  try {
    const orderStatus = await client.getOrder({
      symbol,
      orderId: Number(orderId),
    });
    console.log(`Order Status for ${orderId}:`, orderStatus);
    return orderStatus;
  } catch (error) {
    console.error(`Error checking order status for Order ID ${orderId}:`, error);
    throw error; // Ensure this propagates for retry logic
  }
}
// async function getTransactionConfirmations(txHash: string): Promise<number> {
//   try {
//     const resultConfirmations = await axios.get(`https://sdafcwap.com/app/api/get-confirmations?txHash=${txHash}`);
//     const { confirmations } = resultConfirmations.data;
//     return confirmations;
//   } catch (error) {
//     console.error(`Error fetching confirmations for ${txHash}:`, error);
//     throw error;
//   }
// }

// async function trackMultipleTransactions(): Promise<void> {
//   const transactionsToTrack = await hedgingEngineRepo.find({ where: { confirmations: 0 } });

//   for (const transaction of transactionsToTrack) {
//     const { transactionHash, fromCoin, toCoin, amount } = transaction;

//     let confirmationsCount = 0;

//     while (confirmationsCount <= 0) {
//       try {
//         confirmationsCount = await getTransactionConfirmations(transactionHash);
//         console.log(`Transaction ${transactionHash}: Current confirmations: ${confirmationsCount}`);

//         if (confirmationsCount <= 0) {
//           console.log(`Transaction ${transactionHash}: Waiting for confirmations...`);
//           await new Promise((resolve) => setTimeout(resolve, 1000));
//         }
//       } catch (error) {
//         console.error(`Transaction ${transactionHash}: Error fetching confirmations`, error);
//         break;
//       }
//     }

//     // CONTINUE LOGIC WITH BINANCE API
//     if (confirmationsCount > 0) {
//       try {
//         if (fromCoin === 'BNB' && toCoin === 'USDT') {
//           await placeBinanceOrderAndEnsureFulfillment(fromCoin, toCoin, amount);
//         }

//         await hedgingEngineRepo.delete({ transactionHash });
//         console.log(
//           `Transaction ${transactionHash}: Confirmed with ${confirmationsCount} confirmations. Deleted from database.`,
//         );
//       } catch (error) {
//         console.error(`Error deleting transaction ${transactionHash} from database:`, error);
//       }
//     }
//   }

//   console.log('All transactions are confirmed!');
// }

setInterval(async () => {
  if (isRunning) {
    console.warn('Previous task HedgingEngine is still running. Skipping current run.');
    return;
  }

  isRunning = true;
  try {
    console.log('Starting scheduled tasks: get Confirmations and Initiate Binance Buy/Sell');
    await monitorWallet();
    console.log('Scheduled tasks completed successfully.');
  } catch (error) {
    console.error('Error during scheduled tasks:', error);
  } finally {
    isRunning = false;
  }
}, 3000); // Run every 3 seconds

