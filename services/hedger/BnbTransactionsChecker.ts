import axios from 'axios';
import { getHedgineEngineHistoryLogByTxId } from '../hedgineEngineHistoryLog';

type BnbTransactionType = {
  blocknumber: string;
  timestamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  input: string;
  type: string;
  gas: string;
  gasUsed: string;
  traceId: string;
  isError: string;
  errCode: string;
};

export type NeededResolveOrders = {
  symbol: string;
  direction: string;
  transactions: BnbTransactionType[];
};

export const BnbTransactionsChecker = async (
  walletAddress: string,
  symbol: string,
  direction: string,
): Promise<NeededResolveOrders | null> => {
  let neededResolveOrders: NeededResolveOrders = {
    symbol,
    direction,
    transactions: [] as BnbTransactionType[],
  };

  try {
    const bnbTransfers = await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action: 'txlist',
        address: walletAddress,
        startblock: 0,
        endblock: 999999999,
        page: 1,
        offset: 10000,
        sort: 'desc',
        apiKey: process.env.BSC_SCAN_API_KEY,
      },
    });

    const transactions: BnbTransactionType[] = bnbTransfers.data.result;

    if (transactions) {
      // Fetch all history logs concurrently
      const heHistoryLogPromises = transactions.map((transaction) =>
        getHedgineEngineHistoryLogByTxId(transaction.hash).then((heHistoryLog) => {
          if (!heHistoryLog) {
            return transaction; // Include the transaction if no history log is found
          }
          return null; // Exclude the transaction if history log exists
        })
      );

      // Wait for all promises to resolve
      const resolvedHistoryLogs = await Promise.all(heHistoryLogPromises);

      // Filter out null values and update neededResolveOrders
      const unresolvedTransactions = resolvedHistoryLogs.filter(tx => tx !== null);
      neededResolveOrders = {
        ...neededResolveOrders,
        transactions: unresolvedTransactions as BnbTransactionType[],
      };
    }

  } catch (error) {
    console.error('Error fetching BNB transactions:', error);
  }

  return neededResolveOrders.transactions.length > 0 ? neededResolveOrders : null;
};
