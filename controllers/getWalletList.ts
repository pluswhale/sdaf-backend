import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { signRequest } from './getUserBalanceCeffu';

dotenv.config();

export const getWalletList = async (req: Request, res: Response): Promise<void> => {
  try {
    const timestamp = Date.now().toString();
    const apiKey = process.env.CEFFU_API_KEY_WALLET!;
    const apiSecret = process.env.CEFFU_API_SECRET_WALLET!;
    const params = {
      timestamp,
      pageLimit: '500',
      pageNo: '1',
    };

    const queryString = new URLSearchParams(params).toString();
    const signature = signRequest(queryString, apiSecret);

    const headers = {
      'open-apikey': apiKey,
      signature,
    };

    const endpoint = 'https://open-api.ceffu.com/open-api/v1/wallet/list';

    const response = await axios.get(endpoint, {
      headers,
      params,
    });

    if (response.data.code === '000000') {
      const walletList = response.data.data?.data || [];
      res.status(200).json({ wallets: walletList });
    } else {
      res.status(500).json({ error: response.data.message });
    }
  } catch (error: any) {
    console.error('Error fetching wallet list:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch wallet list' });
  }
};

