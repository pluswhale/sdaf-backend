import axios from 'axios';
const BINANCE_API_BASE_URL = 'https://api.binance.com';
export const getBinancePrice = async (symbol) => {
    try {
        const response = await axios.get(`${BINANCE_API_BASE_URL}/api/v3/ticker/price`, {
            params: { symbol: symbol.toUpperCase() },
        });
        return parseFloat(response.data.price);
    }
    catch (error) {
        console.error(`Failed to fetch price for symbol ${symbol}:`, error);
        return null;
    }
};
export const getMultipleBinancePrices = async (symbols) => {
    const prices = {};
    const pricePromises = symbols.map(async (symbol) => {
        prices[symbol] = await getBinancePrice(symbol);
    });
    await Promise.all(pricePromises);
    return prices;
};
export const getTestPrices = async () => {
    const symbols = ['BNBUSDT', 'ETHUSDT', 'BTCUSDT', 'ETHBTC', 'BNBBTC'];
    return await getMultipleBinancePrices(symbols);
};
