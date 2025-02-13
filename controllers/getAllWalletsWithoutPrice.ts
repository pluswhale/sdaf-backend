import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { Request, Response } from 'express';

const walletRepository = AppDataSource.getRepository(Wallet);

export const getAllWalletsWithoutPrice = async (req: Request, res: Response): Promise<any> => {
  try {
    const wallets = await walletRepository.find();

    if (!wallets) {
      return res.status(400).json({ message: 'Wallets not found' });
    }

    res.status(200).json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

