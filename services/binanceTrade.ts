const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET_KEY,
});

export async function placeLimitBuyOrder(priceCurrency: number, quantityAmount: number, symbolCurrency: string) {
  // symbol ex.BNBUSDT
  try {
    const symbol = symbolCurrency; // Trading pair BNB/USDT
    const quantity = quantityAmount; // Amount of BNB you want to buy
    const price = priceCurrency; // The limit price you're willing to pay for BNB (in USDT)

    // Place a limit buy order
    const order = await client.order({
      symbol: symbol,
      side: 'BUY', // 'BUY' side for the limit order
      type: 'LIMIT', // Limit order type
      price: price.toFixed(2), // Limit price to 2 decimal places
      quantity: quantity, // Quantity of BNB to buy
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

