import { Request, Response } from 'express';

import { AppDataSource } from '../db/AppDataSource';
import { getHedgerConfigOptions } from '../services/getHedgerConfigOptions';

export const getHedgerConfigurationOptions = async (req: Request, res: Response): Promise<any> => {
  try {
    const hedgerConfigOptions = await getHedgerConfigOptions(AppDataSource);

    if (!hedgerConfigOptions || !hedgerConfigOptions?.length) {
      return res.status(400).json({ message: 'Hedger options not found' });
    }

    return res.status(200).send({ hedgerConfigOptions });
  } catch (error) {
    return res.status(400).send('Invalid refresh token.');
  }
};
