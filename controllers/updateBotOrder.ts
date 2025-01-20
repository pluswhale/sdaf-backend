import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { BotOrder } from '../db/entities';



const botOrderRepository = AppDataSource.getRepository(BotOrder);

export const updateBotOrderController = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { c1, c2, c1UsdtRate, c2UsdtRate, orders } = req.body;

  if (!c1 || !c2 || !c1UsdtRate || !c2UsdtRate || !orders) {
    return res.status(400).json({ message: 'All fields (c1, c2, c1UsdtRate, c2UsdtRate, orders) are required' });
  }

  try {
    const botOrder = await botOrderRepository.findOne({ where: { id } });

    if (!botOrder) {
      return res.status(404).json({ message: 'Bot order not found' });
    }

    // Update the bot order properties
    botOrder.c1 = c1;
    botOrder.c2 = c2;
    botOrder.c1UsdtRate = c1UsdtRate;
    botOrder.c2UsdtRate = c2UsdtRate;
    botOrder.orders = orders;

    await botOrderRepository.save(botOrder);

    return res.json({ message: 'Bot order updated successfully', botOrder });
  } catch (error) {
    console.error('Error updating bot order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
