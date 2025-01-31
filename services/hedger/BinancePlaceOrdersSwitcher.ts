import { ethers } from 'ethers';
import { HeObjectForSavingInDb } from '../../types/hedgingEngine';
import { getMarginByPrice } from '../../db/repos/marginRepo';

export const BinancePlaceOrdersSwitcher = async (
  fromCoin: string,
  toCoin: string,
  transaction: any,
  direction: string,
  amount: string | number,
  bestOrder: any,
  targetWalletAddress: string,
): Promise<HeObjectForSavingInDb> => {
  let pair = fromCoin + toCoin;
  let generatedObjectForSavingInDB = {} as HeObjectForSavingInDb;

  switch (pair) {
    case 'BTCUSDT': {
      generatedObjectForSavingInDB.txHash = transaction.hash;
      generatedObjectForSavingInDB.fromCoin = fromCoin;
      generatedObjectForSavingInDB.toCoin = toCoin;
      generatedObjectForSavingInDB.l1SwapAmount = String(transaction.value);
      generatedObjectForSavingInDB.l2SwapAmount = String(transaction.value * +bestOrder[0]);
      generatedObjectForSavingInDB.direction = direction as string;
      generatedObjectForSavingInDB.targetWalletAddress = direction as string;
      generatedObjectForSavingInDB.margin = await getMarginByPrice(
        String(generatedObjectForSavingInDB.priceHedgedOnBinance),
      );
      generatedObjectForSavingInDB.priceSettledToUser = String(
        +bestOrder?.[0] - +bestOrder?.[0] * Number(generatedObjectForSavingInDB.margin?.marginValue),
      ); //needs to come from bot
      generatedObjectForSavingInDB.priceHedgedOnBinance = String(+bestOrder?.[0]);
      generatedObjectForSavingInDB.amountSettledToUser = 'amount settled to user';
      generatedObjectForSavingInDB.amountHedged = 'amount hedged';

      // const marginValuePercentage = parseFloat(String(generatedObjectForSavingInDB.margin?.marginValue)) / 100; //will be needed when we get price settled to user properly
      const profitFromSwap = Math.abs(
        +amount * +generatedObjectForSavingInDB.priceHedgedOnBinance -
          +amount * +generatedObjectForSavingInDB.priceSettledToUser,
      );
      generatedObjectForSavingInDB.profitFromSwap = String(profitFromSwap);
      break;
    }

    case 'BNBUSDT': {
      generatedObjectForSavingInDB.txHash = transaction.hash;
      generatedObjectForSavingInDB.fromCoin = fromCoin;
      generatedObjectForSavingInDB.toCoin = toCoin;
      generatedObjectForSavingInDB.l1SwapAmount = String(ethers.formatUnits(transaction.value, 18));
      generatedObjectForSavingInDB.l2SwapAmount = String(+ethers.formatUnits(transaction.value, 18) * +bestOrder[0]);
      generatedObjectForSavingInDB.direction = direction as string;
      generatedObjectForSavingInDB.targetWalletAddress = direction as string;
      generatedObjectForSavingInDB.margin = await getMarginByPrice(
        String(generatedObjectForSavingInDB.priceHedgedOnBinance),
      );
      generatedObjectForSavingInDB.priceSettledToUser = String(
        +bestOrder?.[0] - +bestOrder?.[0] * Number(generatedObjectForSavingInDB.margin?.marginValue),
      ); //needs to come from bot
      generatedObjectForSavingInDB.priceHedgedOnBinance = String(+bestOrder?.[0]);
      generatedObjectForSavingInDB.amountSettledToUser = 'amount settled to user';
      generatedObjectForSavingInDB.amountHedged = 'amount hedged';

      // const marginValuePercentage = parseFloat(String(generatedObjectForSavingInDB.margin?.marginValue)) / 100; //will be needed when we get price settled to user properly
      const profitFromSwap = Math.abs(
        +amount * +generatedObjectForSavingInDB.priceHedgedOnBinance -
          +amount * +generatedObjectForSavingInDB.priceSettledToUser,
      );
      generatedObjectForSavingInDB.profitFromSwap = String(profitFromSwap);
      break;
    }

    case 'USDTBNB': {
      generatedObjectForSavingInDB.txHash = transaction.hash;
      generatedObjectForSavingInDB.fromCoin = fromCoin;
      generatedObjectForSavingInDB.toCoin = toCoin;
      generatedObjectForSavingInDB.l1SwapAmount = String(ethers.formatUnits(transaction.value, 18));
      generatedObjectForSavingInDB.l2SwapAmount = String(+ethers.formatUnits(transaction.value, 18) / +bestOrder[0]);
      generatedObjectForSavingInDB.direction = direction as string;
      generatedObjectForSavingInDB.targetWalletAddress = direction as string;
      generatedObjectForSavingInDB.margin = await getMarginByPrice(
        String(generatedObjectForSavingInDB.priceHedgedOnBinance),
      );
      generatedObjectForSavingInDB.priceSettledToUser = String(
        +bestOrder?.[0] + +bestOrder?.[0] * Number(generatedObjectForSavingInDB.margin?.marginValue),
      ); //needs to come from bot
      generatedObjectForSavingInDB.priceHedgedOnBinance = String(+bestOrder?.[0]);
      generatedObjectForSavingInDB.amountSettledToUser = 'amount settled to user';
      generatedObjectForSavingInDB.amountHedged = 'amount hedged';

      // const marginValuePercentage = parseFloat(String(generatedObjectForSavingInDB.margin?.marginValue)) / 100; //will be needed when we get price settled to user properly
      const profitFromSwap = Math.abs(
        +amount * +generatedObjectForSavingInDB.priceHedgedOnBinance -
          +amount * +generatedObjectForSavingInDB.priceSettledToUser,
      );
      generatedObjectForSavingInDB.profitFromSwap = String(profitFromSwap);
      break;
    }

    case 'USDTBTC': {
      generatedObjectForSavingInDB.txHash = transaction.txid;
      generatedObjectForSavingInDB.fromCoin = fromCoin;
      generatedObjectForSavingInDB.toCoin = toCoin;
      generatedObjectForSavingInDB.l1SwapAmount = String(ethers.formatUnits(transaction.value, 18));
      generatedObjectForSavingInDB.l2SwapAmount = String(+ethers.formatUnits(transaction.value, 18) / +bestOrder[0]);
      generatedObjectForSavingInDB.direction = direction as string;
      generatedObjectForSavingInDB.targetWalletAddress = direction as string;
      generatedObjectForSavingInDB.margin = await getMarginByPrice(
        String(generatedObjectForSavingInDB.priceHedgedOnBinance),
      );
      generatedObjectForSavingInDB.priceSettledToUser = String(
        +bestOrder?.[0] + +bestOrder?.[0] * Number(generatedObjectForSavingInDB.margin?.marginValue),
      ); //needs to come from bot
      generatedObjectForSavingInDB.priceHedgedOnBinance = String(+bestOrder?.[0]);
      generatedObjectForSavingInDB.amountSettledToUser = 'amount settled to user';
      generatedObjectForSavingInDB.amountHedged = 'amount hedged';

      // const marginValuePercentage = parseFloat(String(generatedObjectForSavingInDB.margin?.marginValue)) / 100; //will be needed when we get price settled to user properly
      const profitFromSwap = Math.abs(
        +amount * +generatedObjectForSavingInDB.priceHedgedOnBinance -
          +amount * +generatedObjectForSavingInDB.priceSettledToUser,
      );
      generatedObjectForSavingInDB.profitFromSwap = String(profitFromSwap);
      break;
    }
  }

  return generatedObjectForSavingInDB;
};
