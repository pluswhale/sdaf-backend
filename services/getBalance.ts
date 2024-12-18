import axios from 'axios';
import { ethProvider } from '../config';
import { Contract, formatEther, formatUnits } from 'ethers';
import { getBitcoinBalance } from '../utils';
import NodeCache from 'node-cache';

import dotenv from 'dotenv';
import { getCache, setCache } from '../utils/cacheService';

dotenv.config();

export const checkBalanceInBNB = async (address: string) => {
  const provider = ethProvider; // Ensure `ethProvider` is connected to the BNB mainnet
  const balanceInWei = await provider.getBalance(address);

  const formattedBalance = parseFloat(formatEther(balanceInWei));

  return formattedBalance;
};

// Bitcoin block

export const getBTCtoUSDTRate = async (): Promise<number> => {
  const cacheKey = 'BTC_USDT_RATE';
  const cachedRate = getCache(cacheKey);

  if (cachedRate !== undefined) {
    return cachedRate;
  }

  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: { symbol: 'BTCUSDT' },
    });

    const btcToUsdtRate = parseFloat(response.data.price);
    setCache(cacheKey, btcToUsdtRate, 60);
    return btcToUsdtRate;
  } catch (error) {
    console.error('Error fetching BTC to USDT rate:', error);
    return 0;
  }
};

export const checkBalanceBTCToUSDT = async (btcAddress: string) => {
  const balanceInBTC = await getBitcoinBalance(btcAddress);

  const btcToUsdtRate = await getBTCtoUSDTRate();

  if (btcToUsdtRate === 0) {
    return { usd: '0.00', btc: balanceInBTC };
  }

  const balanceInUSDT = balanceInBTC * btcToUsdtRate;
  return { usd: balanceInUSDT.toFixed(2), btc: balanceInBTC };
};

// USDT Block

export const fetchUSDTPrice = async (): Promise<number> => {
  const cacheKey = 'USDT_PRICE_USD';
  const cachedPrice = getCache(cacheKey);

  if (cachedPrice !== undefined) {
    return cachedPrice;
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'tether',
        vs_currencies: 'usd',
      },
    });

    const price = response.data.tether.usd;
    setCache(cacheKey, price, 60);
    return price;
  } catch (error) {
    console.error('Error fetching USDT price:', error);
    return 1;
  }
};

const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)', // Add the decimals method
];

const USDT_CONTRACT_ADDRESS: string =
  (process.env.NETWORK === 'testnet'
    ? process.env.USDT_CONTRACT_ADDRESS_TESTNET
    : process.env.USDT_CONTRACT_ADDRESS_MAINNET) || '';

export const checkBalanceUSDT = async (walletAddress: string) => {
  console.log('usdt contract addres', USDT_CONTRACT_ADDRESS);

  const provider = ethProvider;
  const usdtContract = new Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);

  // Get the balance of USDT in the wallet
  const balanceInUSDT = await usdtContract.balanceOf(walletAddress);
  const decimals = await usdtContract.decimals();
  const formattedBalance = parseFloat(formatUnits(balanceInUSDT, decimals));

  return formattedBalance.toFixed(2);
};

