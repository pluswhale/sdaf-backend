import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';

const walletRepo = AppDataSource.getRepository(Wallet);

export const editRebalancerWalletsStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { isRebalancer } = req.body;

    if (typeof isRebalancer !== 'boolean') {
      return res.status(400).json({ message: 'Invalid isRebalancer value' });
    }

    const wallet = await walletRepo.findOne({ where: { id } });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    wallet.isRebalancer = isRebalancer;
    await walletRepo.save(wallet);

    return res.json({ message: 'Wallet updated successfully', wallet });
  } catch (error) {
    console.error('Error updating wallet:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
