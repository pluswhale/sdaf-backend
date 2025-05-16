import axios from 'axios';

import dotenv from 'dotenv';
import { getCache, setCache } from './cacheService';
import { sleep } from './sleep';

dotenv.config();

export const getBitcoinBalance = async (
  address: string,
  isMainnet: boolean,
  currency: string,
): Promise<number | null> => {
  const network: string = isMainnet ? '' : 'testnet/';
  const cacheKey = `BTC_BALANCE_${network}${address}`;

  const cachedBalance = getCache(cacheKey);
  if (cachedBalance !== undefined) {
    return cachedBalance;
  }

  //https://blockstream.info
  try {
    const response = await axios.get(`https://mempool.coinhq.store/${network}api/address/${address}`);
    await sleep(500);
    const funded = response?.data?.chain_stats?.funded_txo_sum;
    const spent = response?.data.chain_stats?.spent_txo_sum;

    const balance = (funded - spent) / 1e8; // Convert from satoshis to BTC

    setCache(cacheKey, balance, 60);

    return balance;
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error);
    return null;
  }
};
