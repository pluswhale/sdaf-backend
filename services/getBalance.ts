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

  return formattedBalance.toFixed(2);
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

export const fetchAssetPrice = async (symbol: string): Promise<number> => {
  const COINGECKO_IDS: { [symbol: string]: string } = {
    ETH: 'ethereum',
    BNB: 'binancecoin',
    USDT_BEP20: 'tether',
    BTC: 'bitcoin',
  };

  const assetId = COINGECKO_IDS[symbol];

  if (!assetId) {
    return 1;
  }

  const cacheKey = `ASSET_PRICE_USD_${symbol}`;
  const cachedPrice = getCache(cacheKey);

  if (cachedPrice !== undefined) {
    return cachedPrice;
  }

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: assetId,
        vs_currencies: 'usd',
      },
    });

    const price = response.data[assetId].usd;
    console.log(`Real price of ${symbol} in USD from CoinGecko: ${price}`);

    setCache(cacheKey, price, 60);
    return price;
  } catch (error) {
    console.error(`Error fetching ${symbol} price:`, error);
    return 1;
  }
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

  return formattedBalance.toFixed(2);
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

