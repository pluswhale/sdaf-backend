import axios from 'axios';
import { CoinWebProviders, ethProviders } from '../config';
import { Contract, formatEther, formatUnits } from 'ethers';
import { getBitcoinBalance } from '../utils';

import dotenv from 'dotenv';

dotenv.config();

//BNB Block

export const checkBalanceInBNB = async (address: string, isMainnet: boolean) => {
  const provider = isMainnet ? ethProviders['bscMainnet'] : ethProviders['bscTestnet'];
  const balanceInWei = await provider.getBalance(address);

  return balanceInWei.toString() === '0n' || !balanceInWei ? 0 : parseFloat(formatEther(balanceInWei));
};

export const checkBalanceInETH = async (address: string, isMainnet: boolean) => {
  const provider = isMainnet ? ethProviders['ethMainnet'] : ethProviders['ethTestnet'];
  const balanceInWei = await provider.getBalance(address);

  return balanceInWei.toString() === '0n' || !balanceInWei ? 0 : parseFloat(formatEther(balanceInWei));
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

export const checkBalanceETHToUSD = async (bnbAddress: string, isMainnet: boolean) => {
  const balanceInETH = await checkBalanceInETH(bnbAddress, isMainnet);

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const ethToUsdRate = prices.ETH;

  if (ethToUsdRate === 0) {
    return { usd: '0.00', eth: balanceInETH };
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

  if (btcToUsdtRate === 0) {
    return { usd: '0.00', btc: balanceInBTC };
  }

  const balanceInUSDT = balanceInBTC * btcToUsdtRate;
  return { usd: balanceInUSDT.toFixed(2), btc: balanceInBTC };
};

// USDT Block

export const checkBalanceUSDTToUSD = async (usdtAddress: string, isMainnet: boolean, contractAddress: string) => {
  const balanceInUSDT = await checkBalanceUSDT(usdtAddress, isMainnet, contractAddress);

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

export const checkBalanceUSDT = async (
  walletAddress: string,
  isMainnet: boolean,
  contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7',
) => {
  try {
    const provider = isMainnet
      ? ethProviders[contractAddress === '0xdAC17F958D2ee523a2206206994597C13D831ec7' ? 'ethMainnet' : 'bscMainnet']
      : ethProviders[contractAddress === '0xdAC17F958D2ee523a2206206994597C13D831ec7' ? 'ethTestnet' : 'bscTestnet'];

    const usdtContract = new Contract(contractAddress, USDT_ABI, provider);

    const balanceInUSDT = await usdtContract?.balanceOf(walletAddress);
    const decimals = await usdtContract.decimals();
    return balanceInUSDT.toString() === '0n' || !balanceInUSDT ? 0 : parseFloat(formatUnits(balanceInUSDT, decimals));
  } catch (e) {
    console.log('error get usdt balance: ', e);
  }

  return 0;
};

export const checkBalanceUSDT_CT = async (walletAddress: string, isMainnet: boolean) => {
  // const USDT_CONTRACT_ADDRESS: string = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
  //
  // console.log('usdt contract addres', USDT_CONTRACT_ADDRESS);
  //
  // const provider = isMainnet ? CoinWebProviders['mainnet'] : CoinWebProviders['testnet'];
  // const usdtContract = new Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
  //
  // // Get the balance of USDT in the wallet
  // const balanceInUSDT = await usdtContract.balanceOf(walletAddress);
  // const decimals = await usdtContract.decimals();
  // const formattedBalance = balanceInUSDT !== '0x' ? parseFloat(formatUnits(balanceInUSDT, decimals)) : 0;
  //
  // return formattedBalance.toFixed(2);

  return 0;
};
