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
    const bnbTransfers =  await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action:  'txlist',
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

    const filteredByFromAddress = transactions?.filter((tx) => {
      return tx.from.toLowerCase() === walletAddress.toLowerCase();
    });

    if (filteredByFromAddress) {
      for (let transaction of filteredByFromAddress) {
        const finaliseRow = await getFinaliseLogByTxId(transaction.hash);

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
    console.log(error);
  }
};
