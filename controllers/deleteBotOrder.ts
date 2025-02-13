import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { BotOrder } from '../db/entities';

const botOrderRepository = AppDataSource.getRepository(BotOrder);

export const deleteBotOrderController = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
  
    try {
      const botOrder = await botOrderRepository.findOne({ where: { id } });
  
      if (!botOrder) {
        return res.status(404).json({ message: 'Bot order not found' });
      }

      await botOrderRepository.remove(botOrder);
  
      return res.json({ message: 'Bot order deleted successfully' });
    } catch (error) {
      console.error('Error deleting bot order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };