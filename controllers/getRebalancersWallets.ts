import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet, WalletType } from '../db/entities';

const walletRepo = AppDataSource.getRepository(Wallet);

export const getRebalancersWallets = async (req: Request, res: Response): Promise<any> => {
  try {
    const rebalancerWallets = await walletRepo.find({ where: { isRebalancer: true } });

    const senders = rebalancerWallets.filter((wallet) => wallet.wallet_type === WalletType.SENDING);
    const receivers = rebalancerWallets.filter((wallet) => wallet.wallet_type === WalletType.RECEIVING);

    return res.json({ senders, receivers });
  } catch (error) {
    console.error('Error fetching rebalancer wallets:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
