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

export const initiateWithdrawalCeffu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, coinSymbol, network, withdrawalAddress, walletId, memo } = req.body;
    const timestamp = Date.now().toString();

    const internalWalletCeffuId = req.query.internalWalletCeffuId as string;

    if (!apiConfig[internalWalletCeffuId]) {
      throw new Error(`API configuration not found for user ID: ${internalWalletCeffuId}`);
    }

    const { apiKey, apiSecret } = apiConfig[internalWalletCeffuId];

    if (!apiKey || !apiSecret) {
      throw new Error('API key, secret, or wallet ID is missing.');
    }

    const params: Record<string, any> = {
      amount,
      coinSymbol,
      memo,
      network,
      requestId: timestamp,
      timestamp,
      walletId,
      withdrawalAddress,
      toWalletIdStr: '',
      customizeFeeAmount: '',
    };

    const jsonBody = JSON.stringify(params);

    const signature = signRequest(jsonBody, apiSecret);

    const headers = {
      'open-apikey': apiKey,
      signature: signature,
      'Content-Type': 'application/json',
    };

    const endpoint = 'https://open-api.ceffu.com/open-api/v2/wallet/withdrawal';

    const response = await axios.post(endpoint, jsonBody, { headers });

    if (response.data.code === '000000') {
      res.status(200).json({
        message: 'Withdrawal Initiated Successfully',
        data: response.data,
      });
    } else {
      res.status(500).json({
        error: 'Withdrawal Failed',
        details: {
          detail: response.data.message,
          walletId: walletId,
          withdrawalAddress: withdrawalAddress,
          jsonBody: jsonBody,
        },
      });
    }
  } catch (error: any) {
    console.error('Error initiating withdrawal:', error.response?.data || error.message);
    const errorDetails = error.response?.data || error.message;
    res.status(500).json({
      error: 'Failed to initiate withdrawal',
      details: errorDetails,
    });
  }
};

