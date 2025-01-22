import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { BotOrder } from '../db/entities';
import { findSuitableOrder } from '../services/findSuitableOrder';
import { HedgineEngineLog } from '../db/entities/HedgineEngineLog';

const hedgineEngineHistoryLogRepo = AppDataSource.getRepository(HedgineEngineLog);

export const getHedgineEngineHistoryLog = async (req: Request, res: Response): Promise<any> => {
  try {
    const heLogs = await hedgineEngineHistoryLogRepo.find();

    if (heLogs.length === 0) {
      return res.status(404).json({ message: 'No he logs found' });
    }

    // Return the updated bot orders
    return res.json({ heLogs });
  } catch (error) {
    console.error('Error fetching or updating he logs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

