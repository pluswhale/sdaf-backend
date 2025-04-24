import { Wallet } from '../db/entities';
import { Request, Response } from 'express';
import { checkBalance } from '../services';

type WalletProcessor = (wallet: Wallet, isMainnet: boolean) => Promise<any>;

const walletWithPrice: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalance(wallet.address, isMainnet, wallet.currency_type);
  if (!price) return wallet;
  return { ...wallet, price };
};

export const walletsWithPrices = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ message: 'No wallets provided' });
    }

    const walletsWithPrices = [];

    for (const wallet of req.body) {
      walletsWithPrices.push(await walletWithPrice(wallet, true));
    }

    console.log('walletsWithPrices', walletsWithPrices);

    res.status(200).json(walletsWithPrices);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};
