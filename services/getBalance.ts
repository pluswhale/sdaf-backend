import axios from 'axios';
import { CoinWebProviders, ethProviders } from '../config';
import { Contract, formatEther, formatUnits } from 'ethers';
import { getBitcoinBalance } from '../utils';

import dotenv from 'dotenv';
import { getCache, setCache } from '../utils/cacheService';

dotenv.config();

//BNB Block

export const checkBalanceInBNB = async (address: string, isMainnet: boolean) => {
  const provider = isMainnet ? ethProviders['mainnet'] : ethProviders['testnet']; // Ensure `ethProvider` is connected to the BNB mainnet
  const balanceInWei = await provider.getBalance(address);

  const formattedBalance = parseFloat(formatEther(balanceInWei));

  return formattedBalance;
};

export const getBNBtoUSDRate = async (): Promise<number> => {
  const cacheKey = 'BNB_USD_RATE';
  const cachedRate = getCache(cacheKey);

  if (cachedRate !== undefined) {
    return cachedRate;
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'binancecoin',
        vs_currencies: 'usd',
      },
    });

    const BnbToUsdRate = response.data.binancecoin.usd;
    setCache(cacheKey, BnbToUsdRate, 60);
    return BnbToUsdRate;
  } catch (error) {
    console.error('Error fetching BNB to USD rate:', error);
    return 0;
  }
};

export const checkBalanceBNBToUSD = async (bnbAddress: string, isMainnet: boolean) => {
  const balanceInBNB = await checkBalanceInBNB(bnbAddress, isMainnet);

  const bnbToUsdRate = await getBNBtoUSDRate();

  if (bnbToUsdRate === 0) {
    return { usd: '0.00', bnb: balanceInBNB };
  }

  const balanceInUSD = balanceInBNB * bnbToUsdRate;
  return { usd: balanceInUSD.toFixed(2), bnb: balanceInBNB };
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

export const checkBalanceBTCToUSDT = async (btcAddress: string, isMainnet: boolean) => {
  const balanceInBTC = await getBitcoinBalance(btcAddress, isMainnet);

  const btcToUsdtRate = await getBTCtoUSDTRate();

  if (btcToUsdtRate === 0) {
    return { usd: '0.00', btc: balanceInBTC };
  }

  const balanceInUSDT = balanceInBTC * btcToUsdtRate;
  return { usd: balanceInUSDT.toFixed(2), btc: balanceInBTC };
};

// USDT Block

export const checkBalanceUSDTToUSD = async (usdtAddress: string, isMainnet: boolean) => {
  const balanceInUSDT = await checkBalanceUSDT(usdtAddress, isMainnet);

  const usdtToUsdRate = await getUSDTtoUSDRate();

  if (usdtToUsdRate === 0) {
    return { usd: '0.00', usdt: balanceInUSDT };
  }

  const balanceInUSD = balanceInUSDT * usdtToUsdRate;
  return { usd: balanceInUSD.toFixed(2), usdt: balanceInUSDT };
};

const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)', // Add the decimals method
];

export const checkBalanceUSDT = async (walletAddress: string, isMainnet: boolean) => {
  const USDT_CONTRACT_ADDRESS: string =
    (isMainnet ? process.env.USDT_CONTRACT_ADDRESS_MAINNET : process.env.USDT_CONTRACT_ADDRESS_TESTNET) || '';

  console.log('usdt contract addres', USDT_CONTRACT_ADDRESS);

  const provider = isMainnet ? ethProviders['mainnet'] : ethProviders['testnet'];
  const usdtContract = new Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);

  // Get the balance of USDT in the wallet
  const balanceInUSDT = await usdtContract.balanceOf(walletAddress);
  const decimals = await usdtContract.decimals();
  const formattedBalance = parseFloat(formatUnits(balanceInUSDT, decimals));

  return formattedBalance;
};

export const checkBalanceUSDT_CT = async (walletAddress: string, isMainnet: boolean) => {
  const USDT_CONTRACT_ADDRESS: string =
    (isMainnet
      ? process.env.USDT_CONTRACT_ADDRESS_MAINNET
      : process.env.USDT_CONTRACT_ADDRESS_MAINNET_DEVNET_COINWEB) || '';

  console.log('usdt contract addres', USDT_CONTRACT_ADDRESS);

  const provider = isMainnet ? CoinWebProviders['mainnet'] : CoinWebProviders['testnet'];
  const usdtContract = new Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);

  // Get the balance of USDT in the wallet
  const balanceInUSDT = await usdtContract.balanceOf(walletAddress);
  const decimals = await usdtContract.decimals();
  const formattedBalance = parseFloat(formatUnits(balanceInUSDT, decimals));

  return formattedBalance.toFixed(2);
};

export const getUSDTtoUSDRate = async (): Promise<number> => {
  const cacheKey = 'USDT_USD_RATE';
  const cachedRate = getCache(cacheKey);

  if (cachedRate !== undefined) {
    return cachedRate;
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'tether',
        vs_currencies: 'usd',
      },
    });

    const BnbToUsdRate = response.data.tether.usd;
    setCache(cacheKey, BnbToUsdRate, 60);
    return BnbToUsdRate;
  } catch (error) {
    console.error('Error fetching USDT to USD rate:', error);
    return 0;
  }
};

