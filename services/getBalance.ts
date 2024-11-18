import axios from 'axios';
import { ethProvider } from '../config';
import { Contract, formatEther, formatUnits } from 'ethers';
import { getBitcoinBalance } from '../utils';

export const checkBalanceInBNB = async (address: string) => {
  const provider = ethProvider; // Ensure `ethProvider` is connected to the BNB mainnet
  const balanceInWei = await provider.getBalance(address);

  const formattedBalance = parseFloat(formatEther(balanceInWei));

  return formattedBalance;
};

export const checkBalanceBTCToUSDT = async (btcAddress: string) => {
  const balanceInBTC = await getBitcoinBalance(btcAddress);

  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: {
        symbol: 'BTCUSDT',
      },
    });

    const btcToUsdtRate = parseFloat(response.data.price);
    const balanceInUSDT = balanceInBTC * btcToUsdtRate;
    return { usd: balanceInUSDT.toFixed(2), btc: balanceInBTC };
  } catch (error) {
    console.log('error get btc price: ', error);
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

