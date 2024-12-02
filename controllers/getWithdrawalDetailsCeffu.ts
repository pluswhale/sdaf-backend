import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { signRequest } from './getUserBalanceCeffu';

dotenv.config();

export const getWithdrawalDetailsCeffu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderViewId } = req.query;
    const timestamp = Date.now().toString();
    const apiKey = process.env.CEFFU_API_KEY_WALLET_WITHDRAWAL!;
    const apiSecret = process.env.CEFFU_API_SECRET_WALLET_WITHDRAWAL!;

    const params = {
      orderViewId: String(orderViewId),
      timestamp: String(timestamp),
    };

    const queryString = new URLSearchParams(params).toString();
    const signature = signRequest(queryString, apiSecret);

    const headers = {
      'open-apikey': apiKey,
      signature: signature,
      'User-Agent': 'Your App/1.0',
    };

    const endpoint = 'https://open-api.ceffu.com/open-api/v2/wallet/withdrawal/detail';

    const response = await axios.get(endpoint, { headers, params });

    if (response.data.code === '000000') {
      res.status(200).json({
        withdrawalDetails: response.data.data || {},
      });
    } else {
      res.status(500).json({
        error: 'Failed to fetch withdrawal details',
        details: response.data.message,
      });
    }
  } catch (error: any) {
    console.error('Error fetching withdrawal details:', error.response?.data || error.message);
    const errorDetails = error.response?.data || error.message;
    res.status(500).json({
      error: 'Failed to fetch withdrawal details',
      details: errorDetails,
    });
  }
};

