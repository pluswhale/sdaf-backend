import axios from 'axios';
import { createFinaliseLog, getFinaliseLogByTxId } from '../hedgineEngineHistoryLog';

export const BtcTransactionsFinaliseChecker = async (
  walletAddress: string,
): Promise<any[]> => {
  try {
    console.time('BtcTransactionsFinaliseChecker');
    const btcTransactionsResponse = await axios.get(`https://mempool.space/api/address/${walletAddress}/txs`);
    const btcTransfers = btcTransactionsResponse?.data;

    if (btcTransfers && btcTransfers.length > 0) {
      const finaliseLogsPromises = btcTransfers.map(async (transaction: any) => {
        const amountInBtc = transaction.vin
          .filter((input: any) => input?.prevout?.scriptpubkey_address === walletAddress)
          .reduce((sum: number, input: any) => sum + input.prevout.value, 0) / 1e8;

        if (amountInBtc > 0 && transaction.status.confirmed) {
          const finaliseRow = await getFinaliseLogByTxId(transaction.hash);

          if (!finaliseRow) {
            return { ...transaction, value: amountInBtc };
          }
        }

        return null;
      });


      const finaliseLogs = await Promise.all(finaliseLogsPromises);
      return finaliseLogs.filter(tx => tx !== null); // Filter out null values

    }

    console.timeEnd('BtcTransactionsFinaliseChecker');
    return []; // Return an empty array if no transactions are found

  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
    return []; // Return an empty array in case of error
  }
};
