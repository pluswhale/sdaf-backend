import axios from 'axios';
import { ethProvider } from '../config/network';
import { Contract, formatEther, formatUnits } from 'ethers';
import { getBitcoinBalance } from '../utils/getBtcToUsdt';

export const checkBalanceBNBToUSDT = async (address: string) => {
  const provider = ethProvider;
  const balanceInBNB = await provider.getBalance(address);
  const formattedBalance = parseFloat(formatEther(balanceInBNB));

  const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
    params: {
      symbol: 'BNBUSDT',
    },
  });

  const bnbToUsdtRate = response.data?.price;
  const balanceInUSDT = formattedBalance * parseFloat(bnbToUsdtRate);

  return balanceInUSDT.toFixed(2); // Round to two decimal places for readability
};

export const checkBalanceBTCToUSDT = async (btcAddress: string) => {
  const balanceInBTC = await getBitcoinBalance(btcAddress);

  const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
    params: {
      symbol: 'BTCUSDT',
    },
  });

  const btcToUsdtRate = parseFloat(response.data.price);
  const balanceInUSDT = balanceInBTC * btcToUsdtRate;
  return balanceInUSDT.toFixed(2);
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

