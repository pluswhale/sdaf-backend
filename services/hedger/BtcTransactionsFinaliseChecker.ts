import axios from 'axios'
import { createFinaliseLog, getFinaliseLogByTxId } from '../hedgineEngineHistoryLog';


export const BtcTransactionsFinaliseChecker = async (
  walletAddress: string,
): Promise<any[] | undefined> => {
  const btcTxs = []
  try {
    const btcTransactionsResponse = await axios.get(`https://mempool.space/api/address/${walletAddress}/txs`);

    const btcTransfers = btcTransactionsResponse?.data;

    if (btcTransfers && btcTransfers.length > 0) {
      for (let transaction of btcTransfers) {
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
      }
      return btcTxs
  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
  }
};
