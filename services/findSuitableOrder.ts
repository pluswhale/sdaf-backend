import axios, { AxiosResponse } from 'axios';

type BinanceOrderbook = {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
};

export enum Direction {
  BUY = 'BUY',
  SELL = 'SELL',
}

const mapToSymbol = {
  BNBUSDT: 'BNBUSDT',
  USDTBNB: 'BNBUSDT',
  BTCUSDT: 'BTCUSDT',
  USDTBTC: 'BTCUSDT',
};

export const findSuitableOrder = async (c1: string, c2: string, amount: number) => {
  try {
    //@ts-ignore
    const { data }: AxiosResponse<BinanceOrderbook> = await axios.get('https://api.binance.com/api/v3/depth', {
      params: {
        //@ts-ignore
        symbol: `${mapToSymbol[c1 + c2]}`,
        limit: 500,
      },
    });
    let filteredOrders;
    let sortedOrders;
    let direction;
    // @ts-ignore
    if (mapToSymbol[c1 + c2] !== c1 + c2) {
      //we buy here
      direction = Direction.BUY;
      filteredOrders = data.asks.filter((el) => Number(el[1]) >= Number(amount));
      sortedOrders = filteredOrders.toSorted((a, b) => Number(a[0]) - Number(b[0]));
    } else {
      //we sell here
      direction = Direction.SELL;
      filteredOrders = data.bids.filter((el) => Number(el[1]) >= Number(amount));
      sortedOrders = filteredOrders.toSorted((a, b) => Number(b[0]) - Number(a[0]));
    }
    //@ts-ignore
    return { direction, symbol: mapToSymbol[c1 + c2], amount, bestOrder: sortedOrders[0] };
  } catch (err) {
    console.log(err);
  }
};

