import * as cron from 'node-cron';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import { AppDataSource } from '../db/AppDataSource';
import Binance from 'binance-api-node';
import { ethers, Wallet } from 'ethers';
import { placeLimitBuyOrder } from '../services/binanceTrade';
import { HedgineEngineLog } from '../db/entities/HedgineEngineLog';

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
const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API_KEY}`;

async function fetchTransactions() {
  try {
    const response = await axios.get(url);
    const transactions = response.data.result;

    if (transactions && transactions.length) {
      console.log('Latest transaction:', transactions[0]);
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
let retries = 0;

async function monitorWallet(): Promise<void> {
  const transactions = await fetchTransactions();

  isEnded = false;

  if (transactions) {
    for (let transaction of transactions) {
      try {
        const fromCoin = 'USDT';
        const toCoin = 'BNB';
        const amount = ethers.formatUnits(transaction.value, 18);

        if (!isEnded) {
          console.log(`Initiating Binance order for ${amount} ${fromCoin} to ${toCoin}.`);
          //@ts-ignore
          const [price, _] = await findSuitableOrder(fromCoin, toCoin, +amount);
          console.log('price', price);

          const result = await placeLimitBuyOrder(price, +amount, toCoin + fromCoin);

          if (result) {
            const orderRes = await checkOrderStatus(result.orderId, fromCoin, toCoin);
            retries++;

            if (orderRes.status === 'FILLED' || retries === 3) {
              isEnded = true;
              return;
            }
          }
        }

        // await placeBinanceOrderAndEnsureFulfillment(fromCoin, toCoin, amount);
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

cron.schedule('* * * * *', () => {
  if (isRunning) {
    console.warn('Previous task HedgingEngine is still running. Skipping current run.');
    return;
  }

  isRunning = true;
  (async () => {
    try {
      console.log('Starting scheduled tasks: get Confirmations and Initiate Binance Buy/Sell');

      await monitorWallet();

      console.log('Scheduled tasks completed successfully.');
    } catch (error) {
      console.error('Error during scheduled tasks:', error);
    } finally {
      isRunning = false;
    }
  })();
});

