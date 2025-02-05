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

// Helper function to introduce delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const btcTransactionsResponse = await axios.get(`https://blockstream.info/api/address/${walletAddress}/txs`);
    const btcTransfers = btcTransactionsResponse?.data;

    if (btcTransfers && btcTransfers.length > 0) {
      const resolvedHistoryLogs: (ExtendedBtcTransaction | null)[] = [];

      for (const transaction of btcTransfers) {
        const amountInBtc =
          transaction.vout
            .filter((output: any) => output?.scriptpubkey_address === walletAddress)
            .reduce((sum: number, output: any) => sum + output.value, 0) / 1e8;

        const heHistoryLog = await getHedgineEngineHistoryLogByTxId(transaction.txid);

        if (!heHistoryLog && amountInBtc > 0 && transaction.status.confirmed) {
          resolvedHistoryLogs.push({
            ...transaction,
            value: amountInBtc, // Set the value (amount in BTC)
          });
        }

        // Introduce a delay to avoid hitting rate limits (adjust delay as needed)
        await delay(400);
      }

      // Filter out null values and update neededResolveOrders
      neededResolveOrders.transactions = resolvedHistoryLogs.filter((tx) => tx !== null) as ExtendedBtcTransaction[];
    }
  } catch (error) {
    console.error('Error fetching BTC transactions:', error);
  }

  return neededResolveOrders.transactions.length > 0 ? neededResolveOrders : null;
};
