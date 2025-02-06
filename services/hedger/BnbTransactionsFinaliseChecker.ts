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


export const BnbTransactionsFinaliseChecker = async (
  walletAddress: string,
) => {
  const bnbTxs = []
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

        if(!finaliseRow) {
          bnbTxs.push(transaction)
          await createFinaliseLog({
            txHash: transaction.hash,
            currency: 'BNB',
            l1SwapAmount: String(ethers.formatUnits(transaction.value, 18)),
          });
        }
        
      }
    }
    return bnbTxs;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
