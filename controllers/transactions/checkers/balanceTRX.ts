import TronWeb from 'tronweb';
import { TOKEN_TRC20_ABI } from '../../../utils/abis';
import { TOKEN_CONTRACTS } from './constants/constants';

export const checkBalanceTRX = async (
  address: string,
  isMainnet: boolean,
  currency: string,
): Promise<number | null> => {
  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: '01',
  });

  try {
    if (currency === 'TRX') {
      const balanceInSun = await tronWeb.trx.getBalance(address);
      return balanceInSun / 1e6;
    } else {
      const contract = await tronWeb.contract(TOKEN_TRC20_ABI, TOKEN_CONTRACTS[currency]);
      const result = await contract.balanceOf(address).call();
      return await TronWeb.fromSun(result.toString());
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
};
