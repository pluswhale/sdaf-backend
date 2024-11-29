import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { signRequest } from './getUserBalanceCeffu';

dotenv.config();

export const initiateWithdrawalCeffu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, coinSymbol, network, withdrawalAddress, walletId, memo } = req.body;
    const timestamp = Date.now().toString();
    const apiKey = process.env.CEFFU_API_KEY_WALLET!;
    const apiSecret = process.env.CEFFU_API_SECRET_WALLET!;

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

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const queryString = sortedParams;

    const signature = signRequest(queryString, apiSecret);

    const headers = {
      'open-apikey': apiKey,
      signature: signature,
      'Content-Type': 'application/json',
    };

    const endpoint = 'https://open-api.ceffu.com/open-api/v2/wallet/withdrawal';

    const response = await axios.post(endpoint, params, { headers });

    if (response.data.code === '000000') {
      res.status(200).json({
        message: 'Withdrawal Initiated Successfully',
        data: response.data,
      });
    } else {
      res.status(500).json({
        error: 'Withdrawal Failed',
        details: response.data.message,
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

