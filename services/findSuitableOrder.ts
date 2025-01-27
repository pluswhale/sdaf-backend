import axios, { AxiosResponse } from 'axios';

type BinanceOrderbook = {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
};



export const findSuitableOrder = async (symbol: string, direction: string, amount: number) => {
  console.log('symbol', symbol);

  try {
    const { data }: AxiosResponse<BinanceOrderbook> = await axios.get('https://api.binance.com/api/v3/depth', {
      //@ts-ignore
      params: {
        symbol,
        limit: 500,
      },
    });
    let filteredOrders;
    let sortedOrders;

    //we buy here
    if (direction === 'BUY') {
      filteredOrders = data?.asks?.filter((el) => Number(el[1]) >= Number(amount));
      sortedOrders = filteredOrders.toSorted((a, b) => Number(a[0]) - Number(b[0]));
      //we sell here
    } else {
      filteredOrders = data?.bids?.filter((el) => Number(el[1]) >= Number(amount));
      sortedOrders = filteredOrders.toSorted((a, b) => Number(b[0]) - Number(a[0]));
    }
    return { amount, bestOrder: sortedOrders[0] };
  } catch (err) {
    console.log(err);
  }
};

