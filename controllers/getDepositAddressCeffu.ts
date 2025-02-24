import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { signRequest } from './getUserBalanceCeffu';

dotenv.config();

interface WalletConfig {
  apiKey: string | undefined;
  apiSecret: string | undefined;
}

const apiConfig: Record<string, WalletConfig> = {
  CeffuWallet1: {
    apiKey: process.env.CEFFU_API_KEY_WALLET_WITHDRAWAL,
    apiSecret: process.env.CEFFU_API_SECRET_WALLET_WITHDRAWAL,
  },
  CeffuWallet2: {
    apiKey: process.env.CEFFU_API_KEY_WALLET_WITHDRAWAL_SECOND_WALLET,
    apiSecret: process.env.CEFFU_API_SECRET_WALLET_WITHDRAWAL_SECOND_WALLET,
  },
};

export const getDepositAddressCeffu = async (req: Request, res: Response): Promise<any> => {
  try {
    const { coinSymbol, network, walletId } = req.query;
    const timestamp = Date.now().toString();

    const accountType = req.query.accountType as string;

    let apiKey: string | undefined;
    let apiSecret: string | undefined;

    switch (accountType) {
      case '276251286620667904':
        apiKey = process.env.CEFFU_API_KEY_WALLET_WITHDRAWAL;
        apiSecret = process.env.CEFFU_API_SECRET_WALLET_WITHDRAWAL;
        break;
      case '441257846101966848':
        apiKey = process.env.CEFFU_API_KEY_WALLET_WITHDRAWAL_SECOND_WALLET;
        apiSecret = process.env.CEFFU_API_SECRET_WALLET_WITHDRAWAL_SECOND_WALLET;
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

    const params = {
      walletId: String(walletId),
      coinSymbol: String(coinSymbol),
      network: String(network),
      timestamp,
    };

    const queryString = new URLSearchParams(params).toString();
    const signature = signRequest(queryString, apiSecret);

    const headers = {
      'open-apikey': apiKey,
      signature: signature,
      'User-Agent': 'Your App/1.0',
    };

    const endpoint = 'https://open-api.ceffu.com/open-api/v1/wallet/deposit/address';

    const response = await axios.get(endpoint, { headers, params });

    res.status(200).json({
      DepositAddress: response.data.data?.walletAddress || [],
    });
  } catch (error: any) {
    console.error('Error fetching deposit address:', error.response?.data || error.message);
    const errorDetails = error.response?.data || error.message;
    res.status(500).json({
      error: 'Failed to fetch deposit address',
      details: errorDetails,
    });
  }
};

