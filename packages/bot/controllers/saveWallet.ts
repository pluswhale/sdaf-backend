import axios from 'axios';
import { Wallet } from '../db/entities/Wallet';
import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';

const walletRepository = AppDataSource.getRepository(Wallet);

export const saveWallet = async (req: Request, res: Response): Promise<void> => {
  const { walletName, walletType, currencyWallet } = req.body;

  try {
    const { wallet_data }: { wallet_data: { publicKeyCompressed: string; publicKeyUncompressed: string } } = (
      await axios.post('http://localhost:5002/api/generate-wallet')
    )?.data;

    console.log('wallet_data', wallet_data);

    if (wallet_data) {
      //SAVE WALLET DATA IN DB
      const wallet = new Wallet();
      wallet.wallet_name = walletName;
      wallet.wallet_type = walletType;
      wallet.currency_type = currencyWallet;
      wallet.pub_key = wallet_data.publicKeyCompressed;

      // Save the wallet in the database
      await walletRepository.save(wallet);

      res.status(201).send({ message: 'Wallet generated and stored' });
    } else {
      res.status(400).send({ message: 'There was error in generating or saving wallet' });
    }
  } catch (error) {
    console.error('Error generating or storing wallet:', error);
    res.status(500).send({ error: 'Failed to generate or store wallet: ' + error });
  }
};

