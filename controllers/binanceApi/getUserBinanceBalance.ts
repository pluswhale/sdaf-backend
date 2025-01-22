import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

// interface AssetBinance {
//   asset: string;
//   free: string | null;
//   locked: string;
//   freeze: string;
//   withdrawing: string;
//   ipoable: string;
//   btcValuation: string;
//   usdValue: number;
// }

export const getUserBinanceBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Spot } = require('@binance/connector');

    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET_KEY;

    if (!apiKey || !apiSecret) {
      throw new Error('API key or secret is missing.');
    }

    const client = new Spot(apiKey, apiSecret);

    const response = await client.userAsset();

    if (response && response.data) {
      const assetsData = response.data || [];

      res.status(200).json({
        balances: assetsData,
      });
    } else {
      res.status(500).json({
        error: 'Failed to fetch user assets',
        details: response?.data || 'No data',
      });
    }
  } catch (error: any) {
    console.error('Unexpected Error:', error.message);
    res.status(500).json({
      error: 'An unexpected error occurred',
      details: error.message,
    });
  }
};

