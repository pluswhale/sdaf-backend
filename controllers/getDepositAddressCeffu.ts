import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { signRequest } from './getUserBalanceCeffu';

dotenv.config();

export const getDepositAddressCeffu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coinSymbol, network, walletId } = req.query;
    const timestamp = Date.now().toString();
    const apiKey = process.env.CEFFU_API_KEY_WALLET_WITHDRAWAL!;
    const apiSecret = process.env.CEFFU_API_SECRET_WALLET_WITHDRAWAL!;

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
      DepositAddressCeffu: response.data.data?.walletAddress || [],
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

