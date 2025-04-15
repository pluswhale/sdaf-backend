import { Wallet } from '../db/entities';
import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';

const walletRepository = AppDataSource.getRepository(Wallet);

export const duplicateWallet = async (req: Request, res: Response): Promise<any> => {
  const { duplicateWallets, walletName } = req.body.values;

  try {
    if (duplicateWallets) {
      const updatedWallets = duplicateWallets.map((wallet: Wallet) => {
        const updatedWallet = new Wallet();
        updatedWallet.wallet_name = walletName;
        updatedWallet.wallet_type = wallet.wallet_type;
        updatedWallet.currency_type = wallet.currency_type;
        updatedWallet.pub_key = wallet.pub_key;
        updatedWallet.address = wallet.address;

        return updatedWallet;
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
