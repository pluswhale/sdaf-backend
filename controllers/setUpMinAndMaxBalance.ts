import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { check, validationResult } from 'express-validator';

export const validateSetUpMixMaxInWallet = [
  check('minValue').isNumeric().withMessage('Min value must be a number'),
  check('maxValue').isNumeric().withMessage('Max value must be a number'),
  check('rebalancingWallet').isNumeric().withMessage('rebalancingWallet value must be a number'),
];

export type PlatformName = 'hwat' | 'panchoSpot' | 'CeffuWallet1' | 'CeffuWallet2';

export const PLATFORM_NAME: Record<PlatformName, string> = {
  hwat: 'binance',
  panchoSpot: 'binance',
  CeffuWallet1: 'ceffu',
  CeffuWallet2: 'ceffu',
};

const walletRepository = AppDataSource.getRepository(Wallet);

export const setUpMinAndMaxWallet = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { maxValue, minValue, rebalancingWallet } = req.body;

  const rebalancingPlatform = PLATFORM_NAME[rebalancingWallet as PlatformName]

  try {
    const wallet = await walletRepository.findOne({ where: { id } });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    wallet.minBalance = minValue;
    wallet.maxBalance = maxValue;
    wallet.rebalancingWallet = rebalancingWallet;
    wallet.rebalancingPlatform = rebalancingPlatform;
    await walletRepository.save(wallet);

    return res.json({ message: 'Wallet updated successfully', wallet });
  } catch (error) {
    console.error('Error updating wallet:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

