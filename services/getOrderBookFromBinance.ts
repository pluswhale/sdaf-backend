import axios from 'axios';

const marginRanges = [
  { min: 0, max: 25, marginValue: '1.0', minOrder: 10 },
  { min: 25, max: 50, marginValue: '0.9', minOrder: 25 },
  { min: 50, max: 100, marginValue: '0.8', minOrder: 50 },
  { min: 100, max: 250, marginValue: '0.7', minOrder: 100 },
  { min: 250, max: 500, marginValue: '0.6', minOrder: 250 },
  { min: 500, max: 1000, marginValue: '0.5', minOrder: 500 },
  { min: 1000, max: 5000, marginValue: '0.4', minOrder: 1000 },
  { min: 5000, max: 10000, marginValue: '0.3', minOrder: 5000 },
  { min: 10000, max: 1_000_000, marginValue: '0.25', minOrder: 10000 },
];

const getMarginValue = (amountUsdt: number): string => {
  for (const range of marginRanges) {
    if (amountUsdt >= range.min && amountUsdt <= range.max) {
      return range.marginValue;
    }
  }
  return '0.0';
};
const calculateOrdersByMarginRange = (amountUsdt: number) => {
  if (amountUsdt <= 0) return;

  const ordersByRange = [];

  for (const { min, max, marginValue, minOrder } of marginRanges) {
    const count = Math.floor(amountUsdt / minOrder);

    if (count > 0) {
      ordersByRange.push({
        range: `${min} – ${max}`,
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

    const countOrdersByMarginRanges = calculateOrdersByMarginRange(bestAskUsdt) || [];

    return {
      bestAsk: {
        price: bestAskPrice,
        amountUsdt: bestAskUsdt,
        amountBtc: bestAskAmount,
        marginValuePercent: getMarginValue(bestAskUsdt),
        marginValueBp: +getMarginValue(bestAskUsdt) * 100,
      },
      bestSell: {
        price: bestSellPrice,
        amountUsdt: bestSellUsdt,
        amountBtc: bestSellAmount,
        marginValuePercent: getMarginValue(bestSellUsdt),
        marginValueBp: +getMarginValue(bestSellUsdt) * 100,
      },
      countOrdersByMarginRanges,
    };
  } catch (error) {
    console.error('Error fetching order book:', error);
    throw new Error('Failed to fetch order book from Binance');
  }
};

