import axios from 'axios';

import dotenv from 'dotenv';
import { getCache, setCache } from './cacheService';

dotenv.config();

export const getBitcoinBalance = async (btcAddress: string, isMainnet: boolean): Promise<number> => {
  const network: string = isMainnet ? '' : 'testnet/';
  const cacheKey = `BTC_BALANCE_${network}${btcAddress}`;

  const cachedBalance = getCache(cacheKey);
  if (cachedBalance !== undefined) {
    return cachedBalance;
  }

  console.log('Fetching balance for address:', btcAddress, 'on network:', network);

  try {
    const response = await axios.get(`https://blockstream.info/${network}api/address/${btcAddress}`);

    const funded = response?.data?.chain_stats?.funded_txo_sum;
    const spent = response?.data.chain_stats?.spent_txo_sum;

    const balance = (funded - spent) / 1e8; // Convert from satoshis to BTC

    setCache(cacheKey, balance, 60);

    return balance;
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error);
    throw new Error('Unable to retrieve Bitcoin balance.');
  }
};

