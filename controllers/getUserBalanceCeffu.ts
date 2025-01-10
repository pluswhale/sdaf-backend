import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';

interface WalletConfig {
  apiKey: string | undefined;
  apiSecret: string | undefined;
  walletId: string;
}

const apiConfig: Record<string, WalletConfig> = {
  CeffuWallet1: {
    apiKey: process.env.CEFFU_API_KEY_WALLET,
    apiSecret: process.env.CEFFU_API_SECRET_WALLET,
    walletId: '276251286620667904',
  },
  CeffuWallet2: {
    apiKey: process.env.CEFFU_API_KEY_SECOND_WALLET_READ_BALANCE,
    apiSecret: process.env.CEFFU_API_SECRET_SECOND_WALLET_READ_BALANCE,
    walletId: '441257846101966848',
  },
};

export const getUserBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const timestamp = Date.now().toString();

    const userId = req.params.userId;

    if (!apiConfig[userId]) {
      throw new Error(`API configuration not found for user ID: ${userId}`);
    }

    const { apiKey, apiSecret, walletId } = apiConfig[userId];

    if (!apiKey || !apiSecret || !walletId) {
      throw new Error('API key, secret, or wallet ID is missing.');
    }

    const params = {
      timestamp: timestamp,
      walletId: walletId,
      pageLimit: '500',
      pageNo: '1',
    };

    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const signature = signRequest(queryString, apiSecret);

    if (!signature) {
      throw new Error('Failed to generate signature.');
    }

    const headers = {
      'open-apikey': apiKey,
      signature,
      'Content-Type': 'application/json',
    };

    const endpoint = 'https://open-api.ceffu.com/open-api/v1/wallet/asset/list';

    try {
      const response = await axios.get(endpoint, {
        headers,
        params,
      });

      if (response.data.code === '000000') {
        const assetsData = response.data.data?.data || [];
        res.status(200).json({
          balances: assetsData,
        });
      } else {
        console.error('API Error:', response.data);
        res.status(500).json({
          error: 'Failed to fetch balances',
          details: response.data,
        });
      }
    } catch (error: any) {
      console.error('Error fetching balances:', error.response?.data || error.message);
      res.status(500).json({
        error: 'Failed to fetch balances',
        details: error.response?.data || error.message,
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

export const signRequest = (data: string, secret: string): string => {
  const privateKey = crypto.createPrivateKey({
    key: Buffer.from(secret, 'base64'),
    type: 'pkcs8',
    format: 'der',
  });
  const sign = crypto.createSign('sha512WithRSAEncryption');
  sign.update(data);
  sign.end();
  const signature = sign.sign(privateKey, 'base64');
  return signature;
};

