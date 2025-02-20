import {
  checkBalanceBNBToUSD,
  checkBalanceBTCToUSDT,
  checkBalanceETHToUSD,
  checkBalanceUSDT_CT,
  checkBalanceUSDTToUSD,
} from '../services';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { Request, Response } from 'express';

const walletRepository = AppDataSource.getRepository(Wallet);

type WalletProcessor = (wallet: Wallet, isMainnet: boolean) => Promise<any>;

const processBTC: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceBTCToUSDT(wallet.address, isMainnet);
  return { ...wallet, price };
};

const processUSDT_BEP20: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceUSDTToUSD(wallet.address, isMainnet, '0x55d398326f99059fF775485246999027B3197955');
  return { ...wallet, price };
};

const processUSDT_ERC20: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceUSDTToUSD(wallet.address, isMainnet, '0xdAC17F958D2ee523a2206206994597C13D831ec7');
  return { ...wallet, price };
};

const processBNB: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceBNBToUSD(wallet.address, isMainnet);
  return { ...wallet, price };
};

const processETH: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceETHToUSD(wallet.address, isMainnet);
  return { ...wallet, price };
};

const processUSDT_CT: WalletProcessor = async (wallet, isMainnet) => {
  const usd = await checkBalanceUSDT_CT(wallet.address, isMainnet);
  return { ...wallet, price: { usd, usdValue: 0 } };
};

const processDefault: WalletProcessor = async (wallet) => {
  return wallet;
};

export const walletProcessors: { [key: string]: WalletProcessor } = {
  BTC: processBTC,
  BTC_T: processBTC,
  USDT_BEP20: processUSDT_BEP20,
  USDT_CT: processUSDT_CT,
  USDT_T: processUSDT_BEP20,
  USDT_TRC20: processUSDT_BEP20,
  USDT_ERC20: processUSDT_ERC20,
  BNB: processBNB,
  ETH: processETH,
};

const testWallets: { [key: string]: boolean } = {
  BTC_T: false,
  USDT_CT: false,
  USDT_T: false,
};

export const getAllWallets = async (req: Request, res: Response): Promise<any> => {
  try {
    const wallets = await walletRepository.find();

    if (!wallets) {
      return res.status(400).json({ message: 'Wallets not found' });
    }

    const walletsWithPrice = await Promise.all(
      wallets.map(async (wallet) => {
        const isMainnet = wallet.currency_type in testWallets ? testWallets[wallet.currency_type] : true;
        const processor = walletProcessors[wallet.currency_type] || processDefault;
        return await processor(wallet, isMainnet);
      }),
    );

    res.status(200).json(walletsWithPrice);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};
