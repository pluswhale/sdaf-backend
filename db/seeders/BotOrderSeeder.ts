import { DataSource } from 'typeorm';
import { BotOrder } from '../entities';
import { Currency } from '../../controllers';

export const seedBotOrdder = async (dataSource: DataSource) => {
  const botOrderRepository = dataSource.getRepository(BotOrder);

  const botOrders = [
    {
      c1: Currency.BNB,
      c2: Currency.USDT_BEP20,
      c1UsdtRate: 300,
      c2UsdtRate: 1,
      orders: [
        { usdAmountC1: 10, number: 5, marginPercent: 2 },
        { usdAmountC1: 30, number: 3, marginPercent: 2 },
      ],
    },
    {
      c1: Currency.BTC,
      c2: Currency.BNB,
      c1UsdtRate: 1200,
      c2UsdtRate: 12,
      orders: [
        { usdAmountC1: 15, number: 4, marginPercent: 2 },
        { usdAmountC1: 18, number: 3, marginPercent: 2 },
      ],
    },
  ];

  const existingBotOrder = await botOrderRepository.find();

  if (existingBotOrder?.length) {
    return;
  } else {
    for (let botOrder of botOrders) {
      await botOrderRepository.save(botOrder);
    }
  }

  console.log('Bot order seeded successfully.');
};
