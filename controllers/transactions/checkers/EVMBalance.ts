import { getProviderUrl } from '../../../config';
import { Contract, formatEther, formatUnits } from 'ethers';
import { TOKEN_CONTRACTS } from './constants/constants';
import { USDT_ABI } from '../../../utils/abis';

export const getEVMBalance = async (address: string, isMainnet: boolean, currency: string): Promise<number | null> => {
  try {
    let balanceInWei;

    const network = isMainnet ? 'Mainnet' : 'Testnet';
    const provider = getProviderUrl(network, currency);

    if (!provider) throw new Error('Provider not found');

    if (TOKEN_CONTRACTS[currency]) {
      const contract = new Contract(TOKEN_CONTRACTS[currency], USDT_ABI, provider);
      balanceInWei = await contract?.balanceOf(address);
      const decimals = await contract.decimals();
      return balanceInWei.toString() === '0n' || !balanceInWei ? 0 : parseFloat(formatUnits(balanceInWei, decimals));
    } else {
      balanceInWei = await provider.getBalance(address);
      return balanceInWei?.toString() === '0n' || !balanceInWei ? 0 : parseFloat(formatEther(balanceInWei));
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
};
