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

export const BnbTransactionsInternalChecker = async (walletAddress: string, symbol: string, direction: string) => {
  let neededResolveOrders: NeededResolveOrders = {
    symbol,
    direction,
    transactions: [] as BnbTransactionType[],
  };

  try {
    const bnbTransfers = await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action: 'txlistinternal',
        address: walletAddress,
        startblock: 0,
        endblock: 999999999,
        page: 1,
        offset: 10000,
        sort: 'desc',
        apiKey: process.env.BSC_SCAN_API_KEY,
      },
    });

    const transactions: BnbTransactionType[] = bnbTransfers.data.result.filter((tx: BnbTransactionType) => tx.to === walletAddress.toLowerCase());

    if (transactions) {
      for (let transaction of transactions) {
        const heHistoryLog = await getHedgineEngineHistoryLogByTxId(transaction.hash);
        if (!heHistoryLog) {
          neededResolveOrders = {
            ...neededResolveOrders,
            transactions: neededResolveOrders.transactions.concat(transaction),
          };
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  if (neededResolveOrders) {
    return neededResolveOrders;
  } else {
    return null;
  }
};
