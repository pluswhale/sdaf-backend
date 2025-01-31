import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { BotOrder } from '../db/entities';
import { findSuitableOrder } from '../services/findSuitableOrder';

const botOrderRepository = AppDataSource.getRepository(BotOrder);

export const getBotOrdersController = async (req: Request, res: Response): Promise<any> => {
  try {
    const botOrders = await botOrderRepository.find();
    if (botOrders.length === 0) {
      return res.status(404).json({ message: 'No bot orders found' });
    }

    for (const botOrder of botOrders) {
      const { mmSellsToken, mmBuysToken } = botOrder;
      const suitableAskOrder = await findSuitableOrder(
        mmSellsToken === 'USDT' || mmSellsToken.startsWith('USDT_') ? 'USDT' : mmSellsToken,
        mmBuysToken === 'USDT' || mmBuysToken.startsWith('USDT_') ? 'USDT' : mmBuysToken,
        0,
      );

      if (suitableAskOrder) {
        const rate = Number(suitableAskOrder.bestOrder[0]);
        console.log(`RATE for ${mmSellsToken} -> ${mmBuysToken}:`, rate);

        // Ensure correct inversion logic
        if (mmSellsToken === 'USDT' || mmSellsToken.startsWith('USDT_')) {
          botOrder.rateBinanceBuy1SellsForBuys = 1 / rate;
        } else {
          botOrder.rateBinanceBuy1SellsForBuys = rate;
        }

        await botOrderRepository.save(botOrder);
      }
    }

    return res.json({ botOrders });
  } catch (error) {
    console.error('Error fetching or updating bot orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
