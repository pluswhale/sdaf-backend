// wallet.controller.ts
import { checkBalanceBNBToUSDT, checkBalanceBTCToUSDT } from '../services/getBalance';
import AppDataSource from '../db/AppDataSource';
import { Wallet } from '../db/entities/Wallet';
import { Request, Response } from 'express';

export const getAllWallets = async (req: Request, res: Response): Promise<any> => {
  try {
    const walletRepository = AppDataSource()?.getRepository(Wallet);
    const wallets = await walletRepository?.find();

    if (!wallets) {
      return res.status(400).json({ message: 'Wallets not found' });
    }

    const walletsWithPrice = wallets?.map(async (wallet) => {
      if (wallet.currency_type === 'BTC') {
        const price = await checkBalanceBTCToUSDT(wallet.address);
        return { ...wallet, price };
      } else if (wallet.currency_type === 'USDT_BEP20') {
        const price = await checkBalanceBNBToUSDT(wallet.address);
        return { ...wallet, price };
      } else {
        return wallet;
      }
    });

    res.status(200).json(walletsWithPrice);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

