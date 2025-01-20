import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { getBotOrder } from '../services/getBotOrder';

export const getBotOrderBodyController = async (req: Request, res: Response): Promise<any> => {
  try {
    const botOrder = await getBotOrder(AppDataSource);

    if (!botOrder) {
      return res.status(400).json({ message: 'Bot order not found' });
    }

    const botOrderResponseObject = JSON.parse(botOrder.orderBody);
    

    return res.status(200).send({ botOrder: botOrderResponseObject });
  } catch (error) {
    return res.status(400).send('Cant get bot order: ' + error);
  }
};

