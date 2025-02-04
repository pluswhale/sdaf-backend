import axios from 'axios';
import { BtcTransaction } from '../../types/hedgingEngine';
import { getHedgineEngineHistoryLogByTxId } from '../hedgineEngineHistoryLog';

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
  direction: string,
): Promise<NeededResolveOrders | null> => {
  let neededResolveOrders: NeededResolveOrders = {
    symbol,
    direction,
    transactions: [] as ExtendedBtcTransaction[],
  };

  try {
    const btcTransactionsResponse = await axios.get(`https://mempool.space/api/address/${walletAddress}/txs`);
    const btcTransfers = btcTransactionsResponse?.data;

    if (btcTransfers && btcTransfers.length > 0) {
      // Fetch all history logs concurrently
      const heHistoryLogPromises = btcTransfers.map((transaction: any) => {
        const amountInBtc =
          transaction.vout
            .filter((output: any) => output?.scriptpubkey_address === walletAddress)
            .reduce((sum: number, output: any) => sum + output.value, 0) / 1e8;

        return getHedgineEngineHistoryLogByTxId(transaction.txid).then((heHistoryLog) => {
          // Only include transactions with no history log, valid amounts, and confirmed status
          if (!heHistoryLog && amountInBtc > 0 && transaction.status.confirmed) {
            return {
              ...transaction,
              value: amountInBtc, // Set the value (amount in BTC)
            };
          }
          return null; // Exclude the transaction if history log exists
        });
      });

      // Wait for all promises to resolve
      const resolvedHistoryLogs = await Promise.all(heHistoryLogPromises);

      // Filter out null values and update neededResolveOrders
      const unresolvedTransactions = resolvedHistoryLogs.filter(tx => tx !== null);
      neededResolveOrders = {
        ...neededResolveOrders,
        transactions: unresolvedTransactions as ExtendedBtcTransaction[],
      };
    }

  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
  }

  return neededResolveOrders.transactions.length > 0 ? neededResolveOrders : null;
};
