import axios from 'axios';
import { ethProvider } from '../config/network';
import { formatEther } from 'ethers';
import { getBitcoinBalance } from '../utils/getBtcToUsdt';
export const checkBalanceBNBToUSDT = async (address) => {
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
export const checkBalanceBTCToUSDT = async (btcAddress) => {
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
