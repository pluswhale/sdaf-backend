import { DataSource } from 'typeorm';
import { BotOrder } from '../db/entities';

export const getBotOrder = async (dataSource: DataSource): Promise<BotOrder> => {
  const botOrderRepository = dataSource.getRepository(BotOrder);
  const botOrder = await botOrderRepository.find();

  return botOrder?.[0];
};

