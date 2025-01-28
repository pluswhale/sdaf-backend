import { ethers } from 'ethers';
import {  HeObjectForSavingInDb } from '../../types/hedgingEngine';


export const BinancePlaceOrdersSwitcher = async (fromCoin: string, toCoin: string, transaction: any, direction: string, amount: string | number, bestOrder: any): Promise<{
  heObjectForSavingInDb: HeObjectForSavingInDb
}> => {
  let pair = fromCoin + toCoin;
  let generatedObjectForSavingInDB = {} as HeObjectForSavingInDb;

  switch (pair) {
    case 'BTCUSDT': {
      generatedObjectForSavingInDB.txHash = transaction.txid;
      generatedObjectForSavingInDB.l1SwapAmount =
        String(transaction.value) +
        ' ' + fromCoin
      generatedObjectForSavingInDB.l2SwapAmount =
        `${String(transaction.value * +bestOrder[0])}` + ' USDT';
      generatedObjectForSavingInDB.pairSwapDirectionOnSwap = fromCoin + ' ' + toCoin;
      generatedObjectForSavingInDB.orderTypeOnBinance = direction as string;
      generatedObjectForSavingInDB.priceSettledToUser =+bestOrder?.[0] * 0.95 + ' USDT'; //needs to come from bot
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
      break;
    }

    case 'BNBUSDT': {
      generatedObjectForSavingInDB.txHash = transaction.hash;
        generatedObjectForSavingInDB.l1SwapAmount =
          String(ethers.formatUnits(transaction.value, 18)) +
           ' ' + fromCoin
        generatedObjectForSavingInDB.l2SwapAmount =
          `${String(+ethers.formatUnits(transaction.value, 18) / +bestOrder[0])}` + ' USDT';
        generatedObjectForSavingInDB.pairSwapDirectionOnSwap = fromCoin + ' ' + toCoin;
        generatedObjectForSavingInDB.orderTypeOnBinance = direction as string;
        generatedObjectForSavingInDB.priceSettledToUser =+bestOrder?.[0] * 0.95 + ' USDT'; //needs to come from bot
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
        break;
    }

    case 'USDTBNB': {
      generatedObjectForSavingInDB.txHash = transaction.hash;
      generatedObjectForSavingInDB.l1SwapAmount = String(ethers.formatUnits(transaction.value, 18)) + 'USDT';
      generatedObjectForSavingInDB.l2SwapAmount = `${String(+ethers.formatUnits(transaction.value, 18) / +bestOrder[0])}` +  ' ' + toCoin
      generatedObjectForSavingInDB.pairSwapDirectionOnSwap = fromCoin + ' ' + toCoin;
      generatedObjectForSavingInDB.orderTypeOnBinance = direction as string;
      generatedObjectForSavingInDB.priceSettledToUser = +bestOrder?.[0] * 1.05 + ' USDT'; //needs to come from bot
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
      break;
    }

    case 'USDTBTC': {
      generatedObjectForSavingInDB.txHash = transaction.hash;
      generatedObjectForSavingInDB.l1SwapAmount = String(ethers.formatUnits(transaction.value, 18)) + 'USDT';
      generatedObjectForSavingInDB.l2SwapAmount = `${String(+ethers.formatUnits(transaction.value, 18) / +bestOrder[0])}` +  ' ' + toCoin
      generatedObjectForSavingInDB.pairSwapDirectionOnSwap = fromCoin + ' ' + toCoin;
      generatedObjectForSavingInDB.orderTypeOnBinance = direction as string;
      generatedObjectForSavingInDB.priceSettledToUser = +bestOrder?.[0] * 1.05 + ' USDT'; //needs to come from bot
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
      break;
    }
  }

  return { heObjectForSavingInDb: generatedObjectForSavingInDB }
};
