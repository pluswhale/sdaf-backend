import axios, { AxiosResponse } from 'axios';

type BinanceOrderbook = {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
};

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
    //@ts-ignore
    if (mapToSymbol[c1 + c2] !== c1 + c2) {
      //we buy here
      console.log('ask order quote');
      filteredOrders = data.asks.filter((el) => Number(el[1]) >= amount);
    } else {
      //we sell here
      console.log('bid order quote');
      filteredOrders = data.bids.filter((el) => Number(el[1]) >= amount);
    }
    const sortedOrders = filteredOrders.toSorted((a, b) => Number(a[1]) - Number(b[1]));
    return sortedOrders[0];
  } catch (err) {
    console.log(err);
  }
};

