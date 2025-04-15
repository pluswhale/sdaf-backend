import { Wallet } from '../db/entities';
import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';

const walletRepository = AppDataSource.getRepository(Wallet);

export const duplicateWallet = async (req: Request, res: Response): Promise<any> => {
  const { duplicateWallets } = req.body;

  try {
    if (duplicateWallets) {
      const updatedWallets = duplicateWallets.map((wallet: Wallet) => {
        const { id, ...walletWithoutId } = wallet;
        return walletWithoutId;
      });

      await walletRepository?.save(updatedWallets);

      return res.status(201).send({
        message: 'Wallets duplicated and stored',
        data: updatedWallets,
      });
    } else {
      return res.status(400).send({ message: 'There was error in duplicating or saving wallet' });
    }
  } catch (error) {
    console.error('Error duplicating or storing wallet:', error);
    res.status(500).send({ error: 'Failed to duplicate or store wallet: ' + error });
  }
};
