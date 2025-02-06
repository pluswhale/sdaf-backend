import axios from 'axios';
import { UsdtTransaction } from '../../types/hedgingEngine';
import { getFinaliseLogByTxId } from '../hedgineEngineHistoryLog';

export const UsdtTransactionsFinaliseChecker = async (walletAddress: string): Promise<any[]> => {
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

    // Filter transactions by 'from' address
    const filteredByFromAddress = transactions?.filter(
      (tx) => tx.from.toLowerCase() === walletAddress.toLowerCase() && tx.value !== '0',
    );

    // Run all getFinaliseLogByTxId requests concurrently using Promise.all
    if (filteredByFromAddress) {
      for (let transaction of filteredByFromAddress) {
            const finaliseRow = await getFinaliseLogByTxId(transaction.hash);
            // console.log(
            //   'finalise row USDT', finaliseRow
            // );

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

// Same approach for other transaction checkers like BnbTransactionsFinaliseChecker, BtcTransactionsFinaliseChecker, etc.
