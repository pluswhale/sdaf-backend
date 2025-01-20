import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { BotOrder } from '../db/entities';



const botOrderRepository = AppDataSource.getRepository(BotOrder);

export const updateBotOrderBodyController = async (req: Request, res: Response): Promise<any> => {

  const { id } = req.params;
  const { botOrderBody } = req.body;

  if (!botOrderBody) {
    return res.status(400).json({ message: 'You need send order bot body' });
  }

  try {
    const botOrder = await botOrderRepository.findOne({ where: { id } });

    if (!botOrder) {
      return res.status(404).json({ message: 'Bot order not found' });
    }

    botOrder.orderBody = JSON.stringify(botOrderBody);
    await botOrderRepository.save(botOrder);

    return res.json({ message: 'Bot order body updated successfully', botOrder });
  } catch (error) {
    console.error('Error updating bot order body:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

