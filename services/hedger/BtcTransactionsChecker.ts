import axios from 'axios';
import { BtcTransaction } from '../../types/hedgingEngine';
import {
  getHedgineEngineHistoryLogByTxId,
} from '../hedgineEngineHistoryLog';




export type NeededResolveOrders = {
  symbol: string;
  direction: string;
  transactions: ExtendedBtcTransaction[];
};

// make field for amount as in eth like response object for tx
export type ExtendedBtcTransaction = BtcTransaction & {
  value: number;
};

export const BtcTransactionsChecker =
  async (walletAddress: string, symbol: string, direction: string): Promise<NeededResolveOrders | null> => {
    let neededResolveOrders: NeededResolveOrders = {
      symbol,
      direction,
      transactions: [] as ExtendedBtcTransaction[],
    };

    try {
      const btcTransfers: BtcTransaction[] = (await axios.get(`https://mempool.space/api/address/${walletAddress}/txs/mempool`))?.data;

      if (btcTransfers && btcTransfers.length > 0) {
        for (let transaction of btcTransfers) {

          const amountInBtc = transaction.vout
            ?.filter((output: any) => output?.scriptpubkey_address === walletAddress)
            ?.reduce((sum: number, output: any) => sum + output.value, 0) / 1e8;

          const heHistoryLog = await getHedgineEngineHistoryLogByTxId(transaction.txid);

          if (!heHistoryLog && amountInBtc > 0) { // Ensure transaction is valid and amount > 0
            const extendedTransaction: ExtendedBtcTransaction = {
              ...transaction,
              value: amountInBtc,
            };

            neededResolveOrders.transactions.push(extendedTransaction);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching BTC transactions:', error);
    }

    return neededResolveOrders.transactions.length > 0 ? neededResolveOrders : null;
  };
