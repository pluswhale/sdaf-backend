import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { BotOrder } from '../db/entities';
import { findSuitableAskOrder } from '../services/findSuitableOrder';

const botOrderRepository = AppDataSource.getRepository(BotOrder);

export const getBotOrdersController = async (req: Request, res: Response): Promise<any> => {
  try {
    const botOrders = await botOrderRepository.find();

    if (botOrders.length === 0) {
      return res.status(404).json({ message: 'No bot orders found' });
    }

    for (const botOrder of botOrders) {
      const { mmSellsToken, mmBuysToken } = botOrder;
      
      const suitableAskOrder = await findSuitableAskOrder(mmSellsToken.includes('USDT') ? 'USDT' : mmSellsToken, mmBuysToken.includes('USDT') ? 'USDT' : mmBuysToken, 0);
      if (suitableAskOrder) {
        const rate = Number(suitableAskOrder[0]); 

        console.log("RATE:" , rate);
        

        botOrder.rateBinanceBuy1SellsForBuys = rate;

        await botOrderRepository.save(botOrder);
      }
    }

    // Return the updated bot orders
    return res.json({ botOrders });
  } catch (error) {
    console.error('Error fetching or updating bot orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};