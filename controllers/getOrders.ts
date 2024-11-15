import { Request, Response } from 'express';
import { getMostProfitableQuotes } from '../services';

export const getOrders = async (req: Request, res: Response): Promise<any> => {
  const symbol = 'BTCUSDT'; // BTC-USDT trading pair

  try {
    const quotes = await getMostProfitableQuotes(symbol);
    res.json({ quotes });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

