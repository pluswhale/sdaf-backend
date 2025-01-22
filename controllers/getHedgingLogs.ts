import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from '../db/AppDataSource';
import { HedgingEngine } from '../db/entities/HedgingEngine';

const HedgingRepository = AppDataSource.getRepository(HedgingEngine);

export const getHedgingLogs: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const hedgingLogs = await HedgingRepository.find();

    if (!hedgingLogs) {
      res.status(404).json({ error: 'Hedging logs not found' });
      return;
    }

    res.status(200).json({ hedgingLogs });
    return;
  } catch (error: any) {
    console.error('Error while getting Hedging logs:', error);
    if (!res.headersSent) {
      console.log('Sending error response');
      res.status(500).json({ error: 'Unable to retrieve Hedging logs.' });
      return;
    }
    next(error);
  }
};

