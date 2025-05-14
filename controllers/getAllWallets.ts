import { Wallet } from '../db/entities';
import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { ParsedQs } from 'qs';

const walletRepository = AppDataSource.getRepository(Wallet);

export const getAllWallets = async (req: Request, res: Response): Promise<any> => {
  try {
    const wallets = await takeWallets(req.query);

    if (!wallets) {
      return res.status(404).json({ message: 'Wallets not found' });
    }

    res.status(200).json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};

export const takeWallets = async (payload?: ParsedQs): Promise<any> => {
  const { type } = payload ? payload : {};

  return type && type === 'test'
    ? await walletRepository.find({ where: { isTest: true } })
    : await walletRepository.find();
};
