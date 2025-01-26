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
        const amount = orders.direction === Direction.SELL
          ? ethers.formatUnits(transaction.value, 18)
          : +ethers.formatUnits(transaction.value, 18) / +bestOrder?.[0];

        const result = await placeBinanceOrder(bestOrder?.[0], +amount,  orders?.symbol?.split('-')?.join(''), orders.direction as Direction);

        if (result && bestOrder) {
          generatedObjectForSavingInDB.l1SwapAmount =
            String(ethers.formatUnits(transaction.value, 18)) +
            `${fromCoin.includes('USDT') ? ' USDT' : ' ' + fromCoin}`;
          generatedObjectForSavingInDB.l2SwapAmount =
            `${
              orders.direction === Direction.BUY
                ? String(+ethers.formatUnits(transaction.value, 18) / +bestOrder[0])
                : String(+ethers.formatUnits(transaction.value, 18) * +bestOrder?.[0])
            }` + `${toCoin.includes('USDT') ? ' USDT' : ' ' + toCoin}`;
          generatedObjectForSavingInDB.pairSwapDirectionOnSwap = fromCoin + ' ' + toCoin;
          generatedObjectForSavingInDB.orderTypeOnBinance = orders.direction;
          generatedObjectForSavingInDB.priceSettledToUser =
            orders.direction === Direction.SELL ? +bestOrder?.[0] * 0.95 + ' USDT' : +bestOrder?.[0] * 1.05 + ' USDT'; //needs to come from bot
          generatedObjectForSavingInDB.priceHedgedOnBinance = +bestOrder?.[0] + ' USDT';
          generatedObjectForSavingInDB.marginValue = '5';

          // Calculate profit margin using quantity
          const priceHedgedOnBinanceValue = parseFloat(
            generatedObjectForSavingInDB.priceHedgedOnBinance.replace(' USDT', ''),
          );

          const priceSettledToUserValue = parseFloat(
            generatedObjectForSavingInDB.priceSettledToUser.replace(' USDT', ''),
          );
          const marginValuePercentage = parseFloat(generatedObjectForSavingInDB.marginValue) / 100;
          // const adjustedPrice = priceHedgedOnBinanceValue * (1 + marginValuePercentage);
          const profitFromSwap = Math.abs(+amount * priceHedgedOnBinanceValue - +amount * priceSettledToUserValue);

          generatedObjectForSavingInDB.profitFromSwap = profitFromSwap + ' USDT';

          // saving hedge engine log
          await createHedgineEngineLogWithOrderIdFromBinance(transaction.hash, generatedObjectForSavingInDB);
        }
      } catch (err) {
        console.log('Something went wrong when placing binance order: ', err);
      }
    }
  }
};

