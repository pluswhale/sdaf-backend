// wallet.controller.ts
import { checkBalanceBTCToUSDT, checkBalanceInBNB, checkBalanceUSDT, fetchUSDTPrice } from '../services';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { Request, Response } from 'express';

const walletRepository = AppDataSource.getRepository(Wallet);

type WalletProcessor = (wallet: Wallet, usdtPrice: number) => Promise<any>;

const processBTC: WalletProcessor = async (wallet, usdtPrice) => {
  const price = await checkBalanceBTCToUSDT(wallet.address);
  return { ...wallet, price };
};

const processUSDT_BEP20: WalletProcessor = async (wallet, usdtPrice) => {
  const usd = await checkBalanceUSDT(wallet.address);
  const bnb = await checkBalanceInBNB(wallet.address);
  const usdValue = parseFloat(usd) * usdtPrice;
  return { ...wallet, price: { usd, bnb, usdValue: usdValue.toFixed(2) } };
};

const processBNB: WalletProcessor = async (wallet, usdtPrice) => {
  const bnb = await checkBalanceInBNB(wallet.address);
  const bnbPrice = await fetchBNBPrice();
  const usdValue = bnb * bnbPrice;
  return { ...wallet, price: { bnb, usdValue: usdValue.toFixed(2) } };
};

const processDefault: WalletProcessor = async (wallet) => {
  return wallet;
};

export const walletProcessors: { [key: string]: WalletProcessor } = {
  BTC: processBTC,
  BTC_T: processBTC,
  USDT_BEP20: processUSDT_BEP20,
  USDT_CT: processUSDT_BEP20,
  USDT_T: processUSDT_BEP20,
  USDT_TRC20: processUSDT_BEP20,
  USDT_ERC20: processUSDT_BEP20,
  BNB: processBNB,
  ETH: processBNB,
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
        const processor = walletProcessors[wallet.currency_type] || processDefault;
        return await processor(wallet, usdtPrice);
      }),
    );

    res.status(200).json(walletsWithPrice);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

