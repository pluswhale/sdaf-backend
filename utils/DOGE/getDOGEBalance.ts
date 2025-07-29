import axios from 'axios';

import dotenv from 'dotenv';
import { sleep } from '../sleep';
import { getCache, setCache } from '../cacheService';

dotenv.config();

export const getDOGEBalance = async (address: string, isMainnet: boolean, currency: string): Promise<number | null> => {
  const cacheKey = `DOGE_BALANCE_${address}`;

  const cachedBalance = getCache(cacheKey);
  if (cachedBalance !== undefined) {
    return cachedBalance;
  }

  try {
    const response = await axios.get(`https://api.tatum.io/v3/dogecoin/address/balance/${address}`, {
      headers: {
        'x-api-key': process.env.TATUM_API_KEY,
      },
    });
    await sleep(500);
    const incoming = parseFloat(response?.data?.incoming || '0');
    const outgoing = parseFloat(response?.data?.outgoing || '0');

    const balance = incoming - outgoing; // Convert from satoshis to DOGE

    setCache(cacheKey, balance, 60);

    return balance;
  } catch (error) {
    console.error('Error fetching Doge balance:', error);
    return null;
  }
};
