import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { FinaliseLog } from '../db/entities';

const finaliseLogRepo = AppDataSource.getRepository(FinaliseLog);

export const getFinaliseLog = async (req: Request, res: Response): Promise<any> => {
  try {
    const finaliseLogs = await finaliseLogRepo.find({
      order: { createdAt: 'DESC' },
    });

    if (finaliseLogs?.length === 0) {
      return res.status(404).json({ message: 'No he logs found' });
    }

    return res.json({ finaliseLogs });
  } catch (error) {
    console.error('Error fetching or updating finalise logs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
