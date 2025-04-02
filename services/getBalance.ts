import axios from 'axios';
import { ethProviders } from '../config';
import { Contract, formatEther, formatUnits } from 'ethers';
import { getBitcoinBalance } from '../utils';

import dotenv from 'dotenv';
import { USDT_ABI } from '../utils/abis';
import { Currency } from '../controllers';

dotenv.config();

//BNB Block

export const checkBalanceInBNB = async (address: string, isMainnet: boolean) => {
  try {
    const provider = isMainnet ? ethProviders['bscMainnet'] : ethProviders['bscTestnet'];
    const balanceInWei = await provider?.getBalance(address);

    return balanceInWei?.toString() === '0n' || !balanceInWei ? 0 : parseFloat(formatEther(balanceInWei));
  } catch (error) {
    console.error('Error fetching BNB balance:', error);
    return null;
  }
};

export const checkBalanceInETH = async (address: string, isMainnet: boolean) => {
  try {
    const provider = isMainnet ? ethProviders['ethMainnet'] : ethProviders['ethTestnet'];
    const balanceInWei = await provider?.getBalance(address);

    return balanceInWei?.toString() === '0n' || !balanceInWei ? 0 : parseFloat(formatEther(balanceInWei));
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return null;
  }
};

export const checkBalanceBNBToUSD = async (bnbAddress: string, isMainnet: boolean) => {
  const balanceInBNB = await checkBalanceInBNB(bnbAddress, isMainnet);

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const bnbToUsdRate = prices.BNB;

  if (bnbToUsdRate === 0 || bnbToUsdRate === undefined || balanceInBNB === null || balanceInBNB === undefined) {
    return {};
  }

  const balanceInUSD = balanceInBNB * bnbToUsdRate;
  return { usd: balanceInUSD.toFixed(2), bnb: balanceInBNB };
};

export const checkBalanceETHToUSD = async (bnbAddress: string, isMainnet: boolean) => {
  const balanceInETH = await checkBalanceInETH(bnbAddress, isMainnet);

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const ethToUsdRate = prices.ETH;

  if (ethToUsdRate === 0 || ethToUsdRate === undefined || balanceInETH === null || balanceInETH === undefined) {
    return {};
  }

  const balanceInUSD = balanceInETH * ethToUsdRate;
  return { usd: balanceInUSD.toFixed(2), eth: balanceInETH };
};

// Bitcoin block
export const checkBalanceBTCToUSDT = async (btcAddress: string, isMainnet: boolean) => {
  const balanceInBTC = await getBitcoinBalance(btcAddress, isMainnet);

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const btcToUsdtRate = prices.BTC;

  if (btcToUsdtRate === 0 || btcToUsdtRate === undefined || balanceInBTC === null || balanceInBTC === undefined) {
    return {};
  }

  const balanceInUSDT = balanceInBTC * btcToUsdtRate;
  return { usd: balanceInUSDT.toFixed(2), btc: balanceInBTC };
};

// USDT Block
export const checkBalanceUSDTToUSD = async (
  usdtAddress: string,
  isMainnet: boolean,
  type: Currency.USDT_BEP20 | Currency.USDT_ERC20 | Currency.USDT_TRC20,
) => {
  let balanceInUSDT;

  switch (type) {
    case Currency.USDT_BEP20: {
      balanceInUSDT = await checkBalanceUSDTBep20(usdtAddress, isMainnet);
      break;
    }

    case Currency.USDT_ERC20: {
      balanceInUSDT = await checkBalanceUSDTErc20(usdtAddress, isMainnet);
      break;
    }
  }

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const usdtToUsdRate = prices.USDT || 1;

  if (balanceInUSDT === null || balanceInUSDT === undefined) {
    return {};
  }

  const balanceInUSD = balanceInUSDT * usdtToUsdRate;
  return { usd: balanceInUSD.toFixed(2), usdt: balanceInUSDT };
};

export const checkBalanceUSDTErc20 = async (walletAddress: string, isMainnet: boolean) => {
  try {
    const provider = ethProviders[isMainnet ? 'ethMainnet' : 'ethTestnet'];

    console.log('cur provider', await provider?.getNetwork());

    const usdtContract = new Contract('0xdAC17F958D2ee523a2206206994597C13D831ec7', USDT_ABI, provider);

    const balanceInUSDT = await usdtContract?.balanceOf(walletAddress);
    const decimals = await usdtContract.decimals();
    return balanceInUSDT.toString() === '0n' || !balanceInUSDT ? 0 : parseFloat(formatUnits(balanceInUSDT, decimals));
  } catch (e) {
    console.log('error get usdt balance: ', e);
    return null;
  }
};

export const checkBalanceUSDTBep20 = async (walletAddress: string, isMainnet: boolean) => {
  try {
    const provider = ethProviders[isMainnet ? 'bscMainnet' : 'bscTestnet'];

    console.log('cur provider', await provider?.getNetwork());

    const usdtContract = new Contract('0x55d398326f99059fF775485246999027B3197955', USDT_ABI, provider);

    const balanceInUSDT = await usdtContract?.balanceOf(walletAddress);
    const decimals = await usdtContract.decimals();
    return balanceInUSDT.toString() === '0n' || !balanceInUSDT ? 0 : parseFloat(formatUnits(balanceInUSDT, decimals));
  } catch (e) {
    console.log('error get usdt balance: ', e);
    return null;
  }
};

export const checkBalanceUSDT_CT = async (walletAddress: string, isMainnet: boolean) => {
  //TODO: Implement this

  return 0;
};
