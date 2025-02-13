import axios from 'axios';
import { createFinaliseLog, getFinaliseLogByTxId, getHedgineEngineHistoryLogByTxId } from '../hedgineEngineHistoryLog';
import { ethers } from 'ethers';

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

export const BnbTransactionsFinaliseChecker = async (walletAddress: string): Promise<any[]> => {
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

    const transactions: BnbTransactionType[] = bnbTransfers.data.result.filter((tx: BnbTransactionType) => tx.from === walletAddress.toLowerCase());

    const filteredByFromAddress = transactions?.filter(
      (tx) => tx.from.toLowerCase() === walletAddress.toLowerCase() && tx.value !== '0',
    );
    // Run all getFinaliseLogByTxId requests concurrently using Promise.all
    if (filteredByFromAddress) {
      const finaliseLogsPromises = filteredByFromAddress.map((transaction) =>
        getFinaliseLogByTxId(transaction.hash).then((finaliseRow) => {
          return finaliseRow ? null : transaction;
        }),
      );

      const finaliseLogs = await Promise.all(finaliseLogsPromises);

      // Filter out null values and return
      return finaliseLogs.filter((tx) => tx !== null);
    }

    return [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
