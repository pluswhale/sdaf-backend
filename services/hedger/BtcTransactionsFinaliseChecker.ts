import axios from 'axios';
import { getFinaliseLogByTxId } from '../hedgineEngineHistoryLog';
import { sleep } from '../../utils/sleep';


export const BtcTransactionsFinaliseChecker = async (walletAddress: string): Promise<any[]> => {
  try {
    const btcTransactionsResponse = await axios.get(`https://blockstream.info/api/address/${walletAddress}/txs`);



    const btcTransfers = btcTransactionsResponse?.data;

    const finalisedTransactions: any[] = [];

    if (btcTransfers && btcTransfers.length > 0) {
      for (const transaction of btcTransfers) {
        const amountInBtc =
          transaction.vin
            .filter((input: any) => input?.prevout?.scriptpubkey_address === walletAddress)
            .reduce((sum: number, input: any) => sum + input.prevout.value, 0) / 1e8;

        if (amountInBtc > 0) {
          const finaliseRow = await getFinaliseLogByTxId(transaction.txid);

          if (!finaliseRow) {
            finalisedTransactions.push({ ...transaction, value: amountInBtc });
          }
        }

        // Introduce a delay between requests to avoid rate limiting
        await sleep(500);
      }
    }

    return finalisedTransactions;
  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
    return [];
  }
};
