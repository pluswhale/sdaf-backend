import { AppDataSource } from '../db/AppDataSource';
import { Request, Response } from 'express';
import { AmlCheckedWallet } from '../db/entities';
import { checkWalletStatus } from '../services/aml';

const repo = AppDataSource.getRepository(AmlCheckedWallet);

export const checkWalletAddressByAmlCryptoSimple = async (req: Request, res: Response): Promise<any> => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    let existing = await repo.findOneBy({ address });

    if (existing) {
      // If it's already marked black or white, return the status directly
      if (existing.status === 'black' || existing.status === 'white') {
        return res.json({ status: existing.status });
      }
    }

    // Perform status check
    const result = await checkWalletStatus(address);

    const normalizedStatus = result === 'black' ? 'black' : 'white';

    if (existing) {
      existing.status = normalizedStatus;
      await repo.save(existing);
    } else {
      const wallet = repo.create({ address, status: normalizedStatus });
      await repo.save(wallet);
    }

    return res.json({ status: normalizedStatus });
  } catch (error) {
    console.error('AML check failed:', error);
    return res.json({ status: 'white' });
  }
};
