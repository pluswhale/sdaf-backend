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

export type ExtendedBtcTransaction = BtcTransaction & {
  value: number;
};

export const BtcTransactionsChecker = async (
  walletAddress: string,
  symbol: string,
  direction: string
): Promise<NeededResolveOrders | null> => {
  let neededResolveOrders: NeededResolveOrders = {
    symbol,
    direction,
    transactions: [] as ExtendedBtcTransaction[],
  };

  try {
    const btcTransactionsResponse = await axios.get(
      `https://mempool.space/api/address/${walletAddress}/txs`
    );

    // console.log('btcTransactionsResponse', btcTransactionsResponse);
    const btcTransfers = btcTransactionsResponse?.data;

    console.log('btcTransfers', btcTransfers);

    if (btcTransfers && btcTransfers.length > 0) {
      for (let transaction of btcTransfers) {
        // Calculate the amount (value) of the transaction outputs relevant to the wallet
        const amountInBtc = transaction.vout
          .filter((output: any) => output?.scriptpubkey_address === walletAddress)
          .reduce((sum: number, output: any) => sum + output.value, 0) / 1e8;

        const heHistoryLog = await getHedgineEngineHistoryLogByTxId(transaction.txid);

        if (!heHistoryLog && amountInBtc > 0 && transaction.status.confirmed) {
          const extendedTransaction = {
            ...transaction,
            value: amountInBtc, // Set the value (amount in BTC)
          };

          //@ts-ignore
          neededResolveOrders.transactions.push(extendedTransaction);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
  }

  return neededResolveOrders.transactions.length > 0 ? neededResolveOrders : null;
};
