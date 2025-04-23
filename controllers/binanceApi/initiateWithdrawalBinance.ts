import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

export const initiateWithdrawalBinance = async (req: Request, res: Response): Promise<any> => {
  try {
    const { Spot } = require('@binance/connector');

    const accountType = req.query.accountType as string;

    const { amount, coinSymbol, network, withdrawalAddress } = req.body;

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

    console.log(apiKey, 'API KEY');
    console.log(apiSecret, 'API Secret');

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        error: 'API key or secret is missing for the specified account.',
      });
    }

    const client = new Spot(apiKey, apiSecret);

    client
      .withdraw(
        coinSymbol, // coin
        withdrawalAddress, // withdraw address
        amount, // amount
        {
          // optional parameters
          network: network, // network (BNB, BEP2, BEP20, ... )
        },
      )
      .then((response: any) =>
        res.status(200).json({
          orderViewId: response.data.id,
        }),
      )
      .catch((error: any) => {
        if (error.response) {
          return res.status(error.response.status).json({
            error: 'Failed to withdraw user assets',
            details: error.response.data || 'No data available from Binance response',
          });
        } else if (error.request) {
          return res.status(500).json({
            error: 'Failed to communicate with Binance API',
            details: 'No response from Binance API',
          });
        } else {
          return res.status(500).json({
            error: 'Unexpected Error',
            details: error.message || 'No specific error message available',
          });
        }
      });
  } catch (error: any) {
    console.error('Unexpected Error:', error.message);
    res.status(500).json({
      error: 'An unexpected error occurred',
      details: error.message,
    });
  }
};
