import axios from 'axios';
import { ethProvider } from '../config/network';
import { formatEther } from 'ethers';

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

