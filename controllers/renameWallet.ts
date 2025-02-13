import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { check, validationResult } from 'express-validator';

export const validateRenamingWallet = [
  check('wallet_name').isString().withMessage('Wallet name value must be a string'),
];

const walletRepository = AppDataSource.getRepository(Wallet);

export const renameWallet = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { wallet_name } = req.body;

  try {
    const wallet = await walletRepository.findOne({ where: { id } });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    wallet.wallet_name = wallet_name;
    await walletRepository.update(id, { wallet_name });

    const updatedWallet = await walletRepository.findOne({ where: { id } });

    return res.json({ message: 'Wallet name updated successfully!', wallet: updatedWallet });
  } catch (error) {
    console.error('Error updating wallet name:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

