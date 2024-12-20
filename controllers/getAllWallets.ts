import {
  checkBalanceBTCToUSDT,
  checkBalanceInBNB,
  checkBalanceUSDT,
  checkBalanceUSDT_CT,
  fetchUSDTPrice,
} from '../services';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { Request, Response } from 'express';

const walletRepository = AppDataSource.getRepository(Wallet);

type WalletProcessor = (wallet: Wallet, usdtPrice: number, isMainnet: boolean) => Promise<any>;

const processBTC: WalletProcessor = async (wallet, usdtPrice, isMainnet) => {
  const price = await checkBalanceBTCToUSDT(wallet.address, isMainnet);
  return { ...wallet, price };
};

const processUSDT_BEP20: WalletProcessor = async (wallet, usdtPrice, isMainnet) => {
  const usd = await checkBalanceUSDT(wallet.address, isMainnet);
  const bnb = await checkBalanceInBNB(wallet.address, isMainnet);
  const usdValue = parseFloat(usd) * usdtPrice;
  return { ...wallet, price: { usd, bnb, usdValue: usdValue.toFixed(2) } };
};

const processUSDT_CT: WalletProcessor = async (wallet, usdtPrice, isMainnet) => {
  const usd = await checkBalanceUSDT_CT(wallet.address, isMainnet);
  const usdValue = parseFloat(usd) * usdtPrice;
  return { ...wallet, price: { usd, usdValue: usdValue.toFixed(2) } };
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
  USDT_ERC20: processUSDT_BEP20,
  BNB: processUSDT_BEP20,
  ETH: processUSDT_BEP20,
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

    const usdtPrice = await fetchUSDTPrice();

    const walletsWithPrice = await Promise.all(
      wallets.map(async (wallet) => {
        const isMainnet = wallet.currency_type in testWallets ? testWallets[wallet.currency_type] : true;
        const processor = walletProcessors[wallet.currency_type] || processDefault;
        return await processor(wallet, usdtPrice, isMainnet);
      }),
    );

    res.status(200).json(walletsWithPrice);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

