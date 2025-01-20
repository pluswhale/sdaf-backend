import { DataSource } from 'typeorm';
import { BotOrder } from '../entities';

export const seedBotOrdder = async (dataSource: DataSource) => {
  const botOrderRepository = dataSource.getRepository(BotOrder);

  const botOrder = {
    pair: 'BNB-BTC',
    orderSize: 5,
    orderValue: 100,
    rateUsdt: '108000-800'

  }

    const existingBotOrder = await botOrderRepository.find();


    const botOrderObject = {
      orderBody: JSON.stringify(botOrder)
    }

    if (!existingBotOrder?.[0]?.orderBody) {
      await botOrderRepository.save(botOrderObject);
    }


  console.log('Bot order seeded successfully.');
};

