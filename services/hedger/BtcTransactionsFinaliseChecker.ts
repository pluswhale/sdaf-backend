import axios from 'axios';
import { createFinaliseLog, getFinaliseLogByTxId } from '../hedgineEngineHistoryLog';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const BtcTransactionsFinaliseChecker = async (walletAddress: string): Promise<any[]> => {
  try {
    console.time('BtcTransactionsFinaliseChecker');
    const btcTransactionsResponse = await axios.get(`https://mempool.space/api/address/${walletAddress}/txs`);
    const btcTransfers = btcTransactionsResponse?.data;

    const finalisedTransactions: any[] = [];

    if (btcTransfers && btcTransfers.length > 0) {
      for (const transaction of btcTransfers) {
        const amountInBtc =
          transaction.vin
            .filter((input: any) => input?.prevout?.scriptpubkey_address === walletAddress)
            .reduce((sum: number, input: any) => sum + input.prevout.value, 0) / 1e8;

        if (amountInBtc > 0 && transaction.status.confirmed) {
          const finaliseRow = await getFinaliseLogByTxId(transaction.hash);

          if (!finaliseRow) {
            finalisedTransactions.push({ ...transaction, value: amountInBtc });
          }
        }

        // Introduce a delay between requests to avoid rate limiting
        await delay(400); // Adjust delay time (500ms) as needed
      }
    }

    console.timeEnd('BtcTransactionsFinaliseChecker');
    return finalisedTransactions;
  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
    return [];
  }
};
