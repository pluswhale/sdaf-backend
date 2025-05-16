import axios from 'axios';
import dotenv from 'dotenv';
import { SUPPORTED_CURRENCIES } from '../controllers/transactions/checkers/constants/constants';

dotenv.config();

export const checkBalance = async (address: string, isMainnet: boolean, currency: string) => {
  let balance: number | null = null;
  let rate: number | undefined = undefined;

  const balanceFunction = SUPPORTED_CURRENCIES[currency];

  if (balanceFunction) {
    balance = await balanceFunction(address, isMainnet, currency);
  }

  const response = await axios.get('https://sdafcwap.com/app/api/get-asset-price');
  const { prices } = response.data;

  rate = prices[currency.split('_')[0]];

  if (balance === null || balance === undefined || rate === undefined || rate === 0) {
    return {};
  }

  const balanceInUSD = balance * rate;

  return { usd: balanceInUSD.toFixed(2), [currency.toLowerCase()]: balance };
};
