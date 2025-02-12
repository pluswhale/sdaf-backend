import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';

import { getHedgerConfigOptions } from '../services/getHedgerConfigOptions';
import { HedgerConfigOptions } from '../db/entities/HedgerConfigOptions';

const hedgerOptionsRepo = AppDataSource.getRepository(HedgerConfigOptions);

export const updateHedgerConfigOption = async (req: Request, res: Response): Promise<any> => {
  const { profitTrashholdFromDb, finaliseCheckerTimeRange } = req.body;

  if (!profitTrashholdFromDb || !finaliseCheckerTimeRange) {
    return res.status(400).json({
      message: 'All fields (profitTrashholdFromDb, finaliseCheckerTimeRange) are required',
    });
  }

  try {
    const hedgerOption = (await getHedgerConfigOptions(AppDataSource))?.[0];

    if (!hedgerOption) {
      return res.status(404).json({ message: 'Bot order not found' });
    }

    hedgerOption.profitTrashholdFromDb = profitTrashholdFromDb;
    hedgerOption.finaliseCheckerTimeRange = finaliseCheckerTimeRange;

    await hedgerOptionsRepo.save(hedgerOption);

    return res.json({ message: 'Hedger option updated successfully', hedgerOption });
  } catch (error) {
    console.error('Error updating hedger option:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
