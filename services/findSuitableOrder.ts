import axios, { AxiosResponse } from 'axios';

type BinanceOrderbook = {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
};

export const findSuitableAskOrder = async (c1: string, c2: string, amount: number) => {
  try {
    const { data }: AxiosResponse<BinanceOrderbook> = await axios.get('https://api.binance.com/api/v3/depth', {
      params: {
        symbol: `${c1 + c2}`,
        limit: 500,
      },
    });
    const filteredOrders = data.asks.filter((el) => Number(el[1]) >= amount);
    const sortedOrders = filteredOrders.toSorted((a, b) => Number(a[1]) - Number(b[1]));
    return sortedOrders[0];
  } catch (err) {
    console.log(err);
  }
};

