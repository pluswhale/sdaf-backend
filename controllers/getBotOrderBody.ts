import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { BotOrder } from '../db/entities';


const botOrderRepository = AppDataSource.getRepository(BotOrder);

export const getBotOrdersController = async (req: Request, res: Response): Promise<any> => {
  try {

    const botOrders = await botOrderRepository.find();

  
    if (botOrders.length === 0) {
      return res.status(404).json({ message: 'No bot orders found' });
    }

    return res.json({  botOrders: botOrders?.map((botOrder) =>  {
      const {id, ...rest} = botOrder;
      return rest;
    })});
  } catch (error) {
    console.error('Error fetching bot orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

