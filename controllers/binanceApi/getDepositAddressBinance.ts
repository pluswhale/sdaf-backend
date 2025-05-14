import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

interface DepositAddressPayload {
  coinSymbol: string;
}

export const getDepositAddressBinance = async (req: Request, res: Response): Promise<any> => {
  try {
    const accountType = req.query.accountType as string;

    const result = await getBinanceDepositAddress(req.body, accountType);

    result
      .then((response: any) =>
        res.status(200).json({
          DepositAddress: response.data.address,
        }),
      )
      .catch((error: any) =>
        res.status(500).json({
          error: 'Failed to get deposit address',
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

export const getBinanceDepositAddress = async (payload: DepositAddressPayload, accountType: string) => {
  const { Spot } = require('@binance/connector');

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
      return {
        error: 'Invalid account type specified. Please provide a valid account query parameter.',
      };
  }

  if (!apiKey || !apiSecret) {
    return {
      error: 'API key or secret is missing for the specified account.',
    };
  }

  const client = new Spot(apiKey, apiSecret);

  const { coinSymbol } = payload;

  try {
    return client.depositAddress(coinSymbol);
  } catch (error: any) {
    console.error('Unexpected Error:', error.message);
    console.log(error);
    return {};
  }
};
