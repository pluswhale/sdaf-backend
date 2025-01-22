import axios from 'axios';
import { CoinWebProviders, ethProviders } from '../config';
import { Contract, formatEther, formatUnits } from 'ethers';
import { getBitcoinBalance } from '../utils';

import dotenv from 'dotenv';

dotenv.config();

//BNB Block

export const checkBalanceInBNB = async (address: string, isMainnet: boolean) => {
  const provider = isMainnet ? ethProviders['mainnet'] : ethProviders['testnet']; // Ensure `ethProvider` is connected to the BNB mainnet
  const balanceInWei = await provider.getBalance(address);

  const formattedBalance = parseFloat(formatEther(balanceInWei));

  return formattedBalance;
};

export const checkBalanceBNBToUSD = async (bnbAddress: string, isMainnet: boolean) => {
  const balanceInBNB = await checkBalanceInBNB(bnbAddress, isMainnet);

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const bnbToUsdRate = prices.BNB;

  if (bnbToUsdRate === 0) {
    return { usd: '0.00', bnb: balanceInBNB };
  }

  const balanceInUSD = balanceInBNB * bnbToUsdRate;
  return { usd: balanceInUSD.toFixed(2), bnb: balanceInBNB };
};

// Bitcoin block

export const checkBalanceBTCToUSDT = async (btcAddress: string, isMainnet: boolean) => {
  const balanceInBTC = await getBitcoinBalance(btcAddress, isMainnet);

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const btcToUsdtRate = prices.BTC;

  if (btcToUsdtRate === 0) {
    return { usd: '0.00', btc: balanceInBTC };
  }

  const balanceInUSDT = balanceInBTC * btcToUsdtRate;
  return { usd: balanceInUSDT.toFixed(2), btc: balanceInBTC };
};

// USDT Block

export const checkBalanceUSDTToUSD = async (usdtAddress: string, isMainnet: boolean) => {
  const balanceInUSDT = await checkBalanceUSDT(usdtAddress, isMainnet);

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const usdtToUsdRate = prices.USDT;

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

