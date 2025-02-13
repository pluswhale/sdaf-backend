import axios from 'axios';
import { AppDataSource } from '../db/AppDataSource';
import { getAllMargins } from './getAllMargins';
import { Margin } from '../db/entities';

const getMarginValue = (amountUsdt: number, marginRanges: Margin[]): number => {
  for (const range of marginRanges) {
    if (amountUsdt >= range.minPrice && amountUsdt <= range.maxPrice) {
      return range.marginValue;
    }
  }
  return 0.0;
};

const calculateOrdersByMarginRange = (amountUsdt: number, marginRanges: Margin[]) => {
  if (amountUsdt <= 0) return;

  const ordersByRange = [];

  for (const { minPrice, maxPrice, marginValue, minOrder } of marginRanges) {
    const count = Math.floor(amountUsdt / minOrder);
    if (count > 0) {
      console.log('prices: ', minPrice, maxPrice);
      ordersByRange.push({
        range: `${minPrice} – ${maxPrice}`,
        marginValue,
        count,
      });
    }
  }

  return ordersByRange;
};

const BINANCE_ORDER_BOOK_API = 'https://api.binance.com/api/v3/depth';

export const getMostProfitableQuotes = async (symbol: string, limit = 100) => {
  try {
    const marginRanges = await getAllMargins(AppDataSource);

    const response = await axios.get(BINANCE_ORDER_BOOK_API, {
      params: { symbol, limit },
    });

    const { bids, asks } = response?.data;

    if (!bids || bids?.length === 0 || !asks || asks?.length === 0) {
      return { message: 'No order book data available' };
    }
    // Find the highest price bid and lowest price ask
    const [bestAskPrice, bestAskAmount] = bids?.[0];
    const [bestSellPrice, bestSellAmount] = asks?.[0];

    const bestAskUsdt = parseFloat((bestAskAmount * bestAskPrice).toFixed(2));
    const bestSellUsdt = parseFloat((bestSellAmount * bestSellPrice).toFixed(2));

    const countOrdersByMarginRanges = calculateOrdersByMarginRange(bestAskUsdt, marginRanges) || [];
    console.log('gmvbausdt: ', getMarginValue(bestSellUsdt, marginRanges));
    return {
      bestAsk: {
        price: bestAskPrice,
        amountUsdt: bestAskUsdt,
        amountBtc: bestAskAmount,
        marginValuePercent: getMarginValue(bestAskUsdt, marginRanges),
        marginValueBp: +getMarginValue(bestAskUsdt, marginRanges) * 100,
      },
      bestSell: {
        price: bestSellPrice,
        amountUsdt: bestSellUsdt,
        amountBtc: bestSellAmount,
        marginValuePercent: getMarginValue(bestSellUsdt, marginRanges),
        marginValueBp: +getMarginValue(bestSellUsdt, marginRanges) * 100,
      },
      countOrdersByMarginRanges,
    };
  } catch (error) {
    console.error('Error fetching order book:', error);
    throw new Error('Failed to fetch order book from Binance');
  }
};

