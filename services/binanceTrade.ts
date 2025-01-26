import { Direction } from './findSuitableOrder';

const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET_KEY,
});

export async function placeBinanceOrder(
  priceCurrency: number,
  quantityAmount: number,
  symbolCurrency: string,
  direction: Direction,
) {

  try {
    const price = +priceCurrency; // The limit price you're willing to pay for BNB (in USDT)

    const exchangeInfo = await client.exchangeInfo();
    const symbolInfo = exchangeInfo.symbols.find((s: any) => s.symbol === symbolCurrency);
    const lotSizeFilter = symbolInfo.filters.find((f: any) => f.filterType === 'LOT_SIZE');

    // Adjust quantity based on LOT_SIZE
    const stepSize = parseFloat(lotSizeFilter.stepSize);
    const adjustedQuantity = (Math.floor(quantityAmount / stepSize) * stepSize)?.toFixed(
      stepSize.toString()?.split('.')?.[1]?.length || 0,
    );

    // Place a limit buy order
    const order = await client.order({
      symbol: symbolCurrency,
      side: direction, // 'BUY' side for the limit order
      type: 'LIMIT', // Limit order type
      price: price.toFixed(2), // Limit price to 2 decimal places
      quantity: adjustedQuantity, // Quantity of BNB to buy
      timeInForce: 'GTC', // 'Good Till Canceled' - the order will remain open until filled or canceled
    });

    console.log('Limit buy order placed:', order);

    return order;
  } catch (error) {
    console.error('Error placing limit buy order:', error);
  }
}

export async function checkOrderStatus(orderId: number, symbol: string) {
  //symbol ex. BNBUSDT
  try {
    const orderStatus = await client.getOrder({
      symbol: symbol, // Trading pair
      orderId: orderId, // The ID of the order you want to check
    });
    return orderStatus;
  } catch (error) {
    console.error('Error checking order status:', error);
  }
}

