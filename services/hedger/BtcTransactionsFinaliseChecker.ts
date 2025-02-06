import axios from 'axios';
import { getFinaliseLogByTxId } from '../hedgineEngineHistoryLog';
import { sleep } from '../../utils/sleep';


export const BtcTransactionsFinaliseChecker = async (
  walletAddress: string,
): Promise<any[] | undefined> => {
  const btcTxs = []
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

          if (amountInBtc > 0 && transaction.status.confirmed) {
            const finaliseRow = await getFinaliseLogByTxId(transaction.hash);
            if(!finaliseRow) {
              btcTxs.push(transaction)
              await createFinaliseLog({
                txHash: transaction.txid,
                currency: 'BTC',
                l1SwapAmount: amountInBtc.toString(),
              });
            }
          }
        }

        // Introduce a delay between requests to avoid rate limiting
        await sleep(500);
      }
      return btcTxs
  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
    return [];
  }
};
