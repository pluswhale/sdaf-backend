import { AppDataSource } from '../db/AppDataSource';

import { Request, Response } from 'express';
import { AmlCheckedWallet } from '../db/entities';
import { checkWalletStatus } from '../services/aml';

const repo = AppDataSource.getRepository(AmlCheckedWallet);

export const checkWalletAddressByAmlCrypto = async (req: Request, res: Response): Promise<any> => {
  const { address } = req.body;
  console.log('address', address);
  if (!address) return res.status(400).json({ error: 'Address is required' });

  const existing = await repo.findOneBy({ address });

  if (existing) {
    // Second check
    if (existing.status === 'checking') {
      const result = await checkWalletStatus(address);

      console.log('result', result);

      if (result === 'white') {
        existing.status = 'white';
        await repo.save(existing);
        return res.json({ message: 'Updated to white', status: 'white' });
      }
      return res.json({ message: 'Still checking', status: existing.status });
    } else {
      return res.json({ message: 'Already checked', status: existing.status });
    }
  }

  // First time check
  const result = await checkWalletStatus(address);
  if (result === 'black') {
    const wallet = repo.create({ address, status: 'black' });
    await repo.save(wallet);
    return res.json({ message: 'Blacklisted', status: 'black' });
  } else {
    const wallet = repo.create({ address, status: 'checking' });
    await repo.save(wallet);
    return res.json({ message: 'Under checking', status: 'checking' });
  }
};
