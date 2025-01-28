import axios from 'axios';
import { UsdtTransaction } from '../../types/hedgingEngine';
import { getHedgineEngineHistoryLogByTxId } from '../hedgineEngineHistoryLog';

export type NeededResolveOrders = {
  symbol: string;
  direction: string;
  transactions: UsdtTransaction[];
};

// const BSC_SCAN_API_KEY = 'WTYZJUZD5RC99WNUAFTIMSII927UYCRG6G';

export const UsdtTransactionsChecker = async (
  walletAddress: string,
  symbol: string,
  direction: string,
  walletType: 'receiver' | 'finalise',
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
    const transactions: UsdtTransaction[] = usdtTransfers?.data?.result;

    if (transactions) {
      for (let transaction of transactions) {
        if (walletType === 'receiver') {
          const heHistoryLog = await getHedgineEngineHistoryLogByTxId(transaction.hash);
          if (!heHistoryLog) {
            neededResolveOrders = {
              ...neededResolveOrders,
              transactions: neededResolveOrders.transactions.concat(transaction),
            };
          }
        } else if (walletType === 'finalise') {
          if (transaction.from === walletAddress) {
            //TODO: call service that will save finilase fields
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }

  if (neededResolveOrders) {
    return neededResolveOrders;
  } else {
    return null;
  }
};
