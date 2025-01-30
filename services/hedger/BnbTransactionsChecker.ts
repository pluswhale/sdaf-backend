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

export type NeededResolveOrders = {
  symbol: string;
  direction: string;
  transactions: BnbTransactionType[];
};

export const BnbTransactionsChecker = async (
  walletAddress: string,
  symbol: string,
  direction: string,
  walletType: 'receiver' | 'finalise',
) => {
  let neededResolveOrders: NeededResolveOrders = {
    symbol,
    direction,
    transactions: [] as BnbTransactionType[],
  };

  try {
    const bnbTransfers =  await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action: walletType === 'receiver' ?  'txlistinternal' : 'txlist',
        address: walletAddress,
        startblock: 0,
        endblock: 999999999,
        page: 1,
        offset: 10000,
        sort: 'desc',
        apiKey: process.env.BSC_SCAN_API_KEY,
      },
    })

    const transactions: BnbTransactionType[] = bnbTransfers.data.result;

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
            const finaliseRow = await getFinaliseLogByTxId(transaction.hash);

            if(!finaliseRow) {
              await createFinaliseLog({
                txHash: transaction.hash,
                currency: 'BNB',
                l1SwapAmount: String(ethers.formatUnits(transaction.value, 18)),
              });
            }

          }
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
