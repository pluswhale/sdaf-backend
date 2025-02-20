import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

export const getDepositDetailBinance = async (req: Request, res: Response): Promise<any> => {
  try {
    const { Spot } = require('@binance/connector');

    const accountType = req.query.accountType as string;

    const { coinSymbol } = req.body;

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
        apiKey = process.env.BINANCE_API_KEY_PANCHO_SPOT_WITHDRAW;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_PANCHO_SPOT_WITHDRAW;
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

    const client = new Spot(apiKey, apiSecret);

    client
      .depositHistory({
        coin: coinSymbol,
        status: 1,
      })
      .then((response: any) =>
        res.status(200).json({
          depositHistory: response.data,
        }),
      )
      .catch((error: any) =>
        res.status(500).json({
          error: 'Failed to get deposit history',
          details: error || 'No data',
        }),
      );
  } catch (error: any) {
    console.error('Unexpected Error:', error.message);
    res.status(500).json({
      error: 'An unexpected error occurred',
      details: error.message,
    });
  }
};

