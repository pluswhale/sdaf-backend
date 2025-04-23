import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

export const getUserBinanceBalance = async (req: Request, res: Response): Promise<any> => {
  try {
    const { Spot } = require('@binance/connector');

    const accountType = req.query.account as string;

    let apiKey: string | undefined;
    let apiSecret: string | undefined;

    switch (accountType) {
      case 'hwat':
        apiKey = process.env.BINANCE_API_KEY_HWAT;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_HWAT;
        break;
      case 'panchoBtc':
        apiKey = process.env.BINANCE_API_KEY_PANCHO_BTC;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_PANCHO_BTC;
        break;
      case 'panchoBnb':
        apiKey = process.env.BINANCE_API_KEY_PANCHO_BNB;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_PANCHO_BNB;
        break;
      case 'panchoSpot':
        apiKey = process.env.BINANCE_API_KEY_PANCHO_SPOT;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_PANCHO_SPOT;
        break;
      default:
        return res.status(400).json({
          error: 'Invalid account type specified. Please provide a valid account query parameter.',
        });
    }

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        error: 'API key or secret is missing for the specified account.',
      });
    }

    const client = new Spot(apiKey, apiSecret, {
      baseURL: 'https://testnet.binance.vision/api',
    });

    // const configurationRestAPI = {
    //   apiKey: apiKey ?? '',
    //   apiSecret: apiSecret ?? '',
    //   basePath: 'https://testnet.binance.vision/api',
    // };
    // const client = new Spot({ configurationRestAPI });

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
