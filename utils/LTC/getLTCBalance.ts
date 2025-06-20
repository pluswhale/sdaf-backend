import axios from 'axios';

import dotenv from 'dotenv';
import { sleep } from '../sleep';
import { getCache, setCache } from '../cacheService';

dotenv.config();

export const getLTCBalance = async (address: string, isMainnet: boolean, currency: string): Promise<number | null> => {
  const network: string = isMainnet ? '' : 'testnet/';
  const cacheKey = `LTC_BALANCE_${network}${address}`;

  const cachedBalance = getCache(cacheKey);
  if (cachedBalance !== undefined) {
    return cachedBalance;
  }

  //https://litecoinspace.org
  try {
    const response = await axios.get(`https://litecoinspace.org/${network}api/address/${address}`);
    await sleep(500);
    const funded = response?.data?.chain_stats?.funded_txo_sum;
    const spent = response?.data.chain_stats?.spent_txo_sum;

    const balance = (funded - spent) / 1e8; // Convert from satoshis to LTC

    setCache(cacheKey, balance, 60);

    return balance;
  } catch (error) {
    console.error('Error fetching Litecoin balance:', error);
    return null;
  }
};
