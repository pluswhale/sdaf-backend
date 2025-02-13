import axios from 'axios';
import { UsdtTransaction } from '../../types/hedgingEngine';
import { getHedgineEngineHistoryLogByTxId } from '../hedgineEngineHistoryLog';

export type NeededResolveOrders = {
  symbol: string;
  direction: string;
  transactions: UsdtTransaction[];
};

export const UsdtTransactionsChecker = async (
  walletAddress: string,
  symbol: string,
  direction: string,
): Promise<NeededResolveOrders | null> => {
  let neededResolveOrders: NeededResolveOrders = {
    symbol,
    direction,
    transactions: [] as any,
  };

  try {
    const usdtTransfers = await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: '0x55d398326f99059fF775485246999027B3197955',
        address: walletAddress,
        startblock: 0,
        endblock: 999999999,
        page: 1,
        offset: 10000,
        sort: 'desc',
        apiKey: process.env.BSC_SCAN_API_KEY,
      },
    });

    const transactions: UsdtTransaction[] = usdtTransfers?.data?.result.filter((tx: UsdtTransaction) => tx.to === walletAddress.toLowerCase());

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
        transactions: unresolvedTransactions as UsdtTransaction[],
      };
    }

  } catch (error) {
    console.error('Error fetching transactions:', error);
  }

  return neededResolveOrders.transactions.length > 0 ? neededResolveOrders : null;
};
