import { createHedgineEngineLogWithOrderIdFromBinance } from '../hedgineEngineHistoryLog';
import { Direction, findSuitableOrder } from '../findSuitableOrder';
import { ethers } from 'ethers';
import { placeBinanceOrder } from '../binanceTrade';

type Orders = {
  symbol: string;
  direction: string;
  transactions: any[];
};

export const placeOrderToBinanceResolver = async (orders: Orders) => {
  if (orders) {
    const fromCoin = orders?.symbol?.split('-')?.[0];
    const toCoin = orders?.symbol?.split('-')?.[1];
    for (let transaction of orders?.transactions) {
      let generatedObjectForSavingInDB = {} as {
        pairSwapDirectionOnSwap?: string;
        l1SwapAmount?: string;
        l2SwapAmount?: string;
        orderTypeOnBinance?: string;
        priceSettledToUser?: string;
        priceHedgedOnBinance?: string;
        marginValue?: string;
        profitFromSwap?: string;
      };

      try {
        //@ts-ignore
        const { bestOrder, amount: quantity } = await findSuitableOrder(
          orders?.symbol?.split('-')?.join(''),
          orders.direction,
          0,
        );


      } catch (err) {
        console.log('Something went wrong when placing binance order: ', err);
      }
    }
  }
};
