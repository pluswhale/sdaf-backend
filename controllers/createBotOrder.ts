import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { BotOrder } from '../db/entities';



const botOrderRepository = AppDataSource.getRepository(BotOrder);

export const createBotOrderController = async (req: Request, res: Response): Promise<any> => {
  const { mmSellsToken, mmBuysToken, rateBinanceBuy1SellsForBuys, orders } = req.body;

  if (!mmSellsToken || !mmBuysToken || !rateBinanceBuy1SellsForBuys  || !orders) {
    return res.status(400).json({ message: 'All fields (c1, c2, c1UsdtRate, c2UsdtRate, orders) are required' });
  }



  try {
    const botOrder = new BotOrder();
    botOrder.mmSellsToken = mmSellsToken;
    botOrder.mmBuysToken = mmBuysToken;
    botOrder.rateBinanceBuy1SellsForBuys = rateBinanceBuy1SellsForBuys;
    botOrder.orders = orders;

    await botOrderRepository.save(botOrder);

    return res.json({ message: 'Bot order created successfully', botOrder });
  } catch (error) {
    console.error('Error updating bot order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
