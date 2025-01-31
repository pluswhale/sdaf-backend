import {  findSuitableOrder } from '../findSuitableOrder';
import { BinancePlaceOrdersSwitcher } from './BinancePlaceOrdersSwitcher';
import { OrdersWithTxs } from '../../types/hedgingEngine';
import { ethers } from 'ethers';
import { placeBinanceOrder } from '../binanceTrade';
import { createHedgineEngineLogWithOrderIdFromBinance } from '../hedgineEngineHistoryLog';
import { Direction } from '../../types/enum';



export const placeOrderToBinanceResolver = async (orders: OrdersWithTxs) => {
  if (orders) {
    const fromCoin = orders.direction === Direction.SELL ? orders?.symbol?.split('-')?.[0] : orders?.symbol?.split('-')?.[1];
    const toCoin = orders.direction === Direction.BUY ? orders?.symbol?.split('-')?.[1] : orders?.symbol?.split('-')?.[0];

    for (let transaction of orders?.transactions) {
      try {
        //@ts-ignore
        const { bestOrder, amount: quantity } = await findSuitableOrder(
          orders?.symbol?.split('-')?.join(''),
          orders.direction,
          0,
        );

        const amount = orders.symbol === 'BTC-USDT' ? transaction.value :
          orders.direction === Direction.SELL
            ? ethers.formatUnits(transaction.value, 18)
            : +ethers.formatUnits(transaction.value, 18) / +bestOrder?.[0];

        const result = await placeBinanceOrder(
          bestOrder?.[0],
          +amount,
          orders?.symbol?.split('-')?.join('') as string,
          orders.direction as Direction,
        );
        console.log('result: ', result)
        if (result) {
          const heObjectForSavingInDb = await BinancePlaceOrdersSwitcher(fromCoin , toCoin, transaction,  orders.direction, amount, bestOrder, 'targetWalletAddress');
          console.log('heObjectForSavingInDb: ', heObjectForSavingInDb)
          await createHedgineEngineLogWithOrderIdFromBinance(heObjectForSavingInDb);
        }

      } catch (err) {
        console.log('Something went wrong when placing binance order: ', err);
      }
    }
  }
};
