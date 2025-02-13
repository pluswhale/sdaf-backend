import { DataSource } from 'typeorm';
import { BotOrder } from '../entities';
import { CurrencyForBotOrder } from '../../types/enum';





export const seedBotOrder = async (dataSource: DataSource) => {
  const botOrderRepository = dataSource.getRepository(BotOrder);

  const botOrders = [
    {
      mmSellsToken: CurrencyForBotOrder.BNB,
      mmBuysToken: CurrencyForBotOrder.USDT_BNB,
      rateBinanceBuy1SellsForBuys: 300,
      orders: [
        { mmSellTokenAmount: 10, ordersNumber: 5, marginPercent: 2 },
        { mmSellTokenAmount: 30, ordersNumber: 3, marginPercent: 2 },
      ],
    },
    {
      mmSellsToken: CurrencyForBotOrder.BTC,
      mmBuysToken: CurrencyForBotOrder.BNB,
      rateBinanceBuy1SellsForBuys: 1200,
      orders: [
        { mmSellTokenAmount: 15, ordersNumber: 4, marginPercent: 2 },
        { mmSellTokenAmount: 18, ordersNumber: 3, marginPercent: 2 },
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