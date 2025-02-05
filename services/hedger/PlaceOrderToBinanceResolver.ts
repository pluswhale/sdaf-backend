import { findSuitableOrder } from '../findSuitableOrder';
import { BinancePlaceOrdersSwitcher } from './BinancePlaceOrdersSwitcher';
import { OrdersWithTxs } from '../../types/hedgingEngine';
import { ethers } from 'ethers';
import { placeBinanceOrder } from '../binanceTrade';
import { createHedgineEngineLogWithOrderIdFromBinance } from '../hedgineEngineHistoryLog';
import { Direction } from '../../types/enum';

export const placeOrderToBinanceResolver = async (orders: OrdersWithTxs, profitFromSwap: number, pairAndDirectionObj: {symbol: string, direction: string}) => {



  if (orders && pairAndDirectionObj.direction && pairAndDirectionObj.symbol) {
    const fromCoin =
      pairAndDirectionObj.direction === Direction.SELL ? pairAndDirectionObj.symbol.split('-')[0] : pairAndDirectionObj.symbol.split('-')[1];
    const toCoin =
      pairAndDirectionObj.direction === Direction.SELL ? pairAndDirectionObj.symbol.split('-')[1] : pairAndDirectionObj.symbol.split('-')[0];

    for (let transaction of orders?.transactions) {
      try {
        //@ts-ignore
        const { bestOrder, amount: quantity } = await findSuitableOrder(
          pairAndDirectionObj.symbol.split('-').join(''),
          pairAndDirectionObj.direction,
          0,
        );

        const amount =
          pairAndDirectionObj.symbol === 'BTC-USDT'
            ? pairAndDirectionObj.direction === Direction.BUY
              ? +ethers.formatUnits(transaction.value, 18) / +bestOrder?.[0]
              : transaction.value
            : pairAndDirectionObj.direction === Direction.SELL
              ? ethers.formatUnits(transaction.value, 18)
              : +ethers.formatUnits(transaction.value, 18) / +bestOrder?.[0];

        console.log('direaction!!!!!!!!!!!!!!!!!', pairAndDirectionObj.direction);
        console.log('symbol!!!!!!!!!!!!!!!', pairAndDirectionObj.symbol);
        console.log('amoint!!!!!!!!!!!!!!!!!!!!!!!!!!!!', amount);

        const result = await placeBinanceOrder(
          bestOrder?.[0],
          +amount,
          pairAndDirectionObj?.symbol?.split('-')?.join('') as string,
          pairAndDirectionObj.direction as Direction,
        );
        console.log('result: ', result);
        if (result) {
          const heObjectForSavingInDb = await BinancePlaceOrdersSwitcher(
            fromCoin,
            toCoin,
            transaction,
            pairAndDirectionObj.direction,
            amount,
            bestOrder,
            'targetWalletAddress',
            profitFromSwap,
          );
          console.log('heObjectForSavingInDb: ', heObjectForSavingInDb);
          await createHedgineEngineLogWithOrderIdFromBinance(heObjectForSavingInDb);
        }

        return result;
      } catch (err) {
        console.log('Something went wrong when placing binance order: ', err);
      }
    }
  }
};
