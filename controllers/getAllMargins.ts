import { Request, Response } from 'express';
import { getAllMargins } from '../services/getAllMargins';
import { AppDataSource } from '../db/AppDataSource';

export const getAllMarginsController = async (req: Request, res: Response): Promise<any> => {
  try {
    const margins = await getAllMargins(AppDataSource);

    if (!margins || !margins?.length) {
      return res.status(400).json({ message: 'Margins not found' });
    }

    return res.status(200).send({ margins });
  } catch (error) {
    return res.status(400).send('Invalid refresh token.');
  }
};

