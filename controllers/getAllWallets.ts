// wallet.controller.ts
import { checkBalanceBTCToUSDT, checkBalanceInBNB, checkBalanceUSDT } from '../services';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { Request, Response } from 'express';

const walletRepository = AppDataSource.getRepository(Wallet);

export const getAllWallets = async (req: Request, res: Response): Promise<any> => {
  try {
    const wallets = await walletRepository.find();

    if (!wallets) {
      return res.status(400).json({ message: 'Wallets not found' });
    }

    const walletsWithPrice = await Promise.all(
      wallets.map(async (wallet) => {
        if (wallet.currency_type === 'BTC') {
          const price = await checkBalanceBTCToUSDT(wallet.address);
          return { ...wallet, price };
        } else if (wallet.currency_type === 'USDT_BEP20') {
          const price = await checkBalanceUSDT(wallet.address);
          return { ...wallet, price };
        } else {
          return wallet;
        }
      }),
    );

    res.status(200).json(walletsWithPrice);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

