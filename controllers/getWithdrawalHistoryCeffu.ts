import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { signRequest } from './getUserBalanceCeffu';

dotenv.config();

export const getWithdrawalHistoryCeffu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletId, coinSymbol, network } = req.query;
    const timestamp = Date.now().toString();
    const apiKey = process.env.CEFFU_API_KEY_WALLET_WITHDRAWAL!;
    const apiSecret = process.env.CEFFU_API_SECRET_WALLET_WITHDRAWAL!;

    const now = new Date();
    const startTime = now.getTime().toString();
    const endTime = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime().toString();

    const params = {
      walletId: String(walletId),
      coinSymbol: String(coinSymbol),
      network: String(network),
      startTime,
      endTime,
      pageLimit: '25',
      pageNo: '1',
      status: '10',
      timestamp,
    };

    const queryString = new URLSearchParams(params).toString();
    const signature = signRequest(queryString, apiSecret);

    const headers = {
      'open-apikey': apiKey,
      signature: signature,
      'User-Agent': 'Your App/1.0',
    };

    const endpoint = 'https://open-api.ceffu.com/open-api/v2/wallet/withdrawal/history';

    const response = await axios.get(endpoint, { headers, params });

    if (response.data.code === '000000') {
      res.status(200).json({
        withdrawalHistory: response.data.data?.data || [],
      });
    } else {
      res.status(500).json({ error: response.data.message });
    }
  } catch (error: any) {
    console.error('Error fetching withdrawal history:', error.response?.data || error.message);
    const errorDetails = error.response?.data || error.message;
    res.status(500).json({
      error: 'Failed to fetch withdrawal history',
      details: errorDetails,
    });
  }
};

