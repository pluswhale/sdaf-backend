import { ethProvider } from '../../config';
import { Wallet, Contract, parseEther } from 'ethers';
import erc20ABI from './abis/erc20ABI.json';

export const sendUSDT = async (
  fromPrivateKey: string,
  toAddress: string,
  amount: number,
): Promise<string | undefined> => {
  const provider = ethProvider;
  const usdtContractAddress = '0x55d398326f99059fF775485246999027B3197955';

  const wallet = new Wallet(fromPrivateKey, provider);
  const usdtContract = new Contract(usdtContractAddress, erc20ABI, wallet);

  try {
    const tx = await usdtContract.transfer(toAddress, parseEther(amount.toString()));

    const receipt = await tx.wait();
    console.log('Transaction successful with txId:', receipt.transactionHash);
    return receipt.transactionHash;
  } catch (error) {
    console.error('Error sending USDT:', error);
    return undefined;
  }
};
