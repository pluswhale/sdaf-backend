import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { signRequest } from './getUserBalanceCeffu';

dotenv.config();

export const initiateWithdrawalCeffu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, coinSymbol, network, withdrawalAddress, walletId, memo } = req.body;
    const timestamp = Date.now().toString();
    const apiKey = process.env.CEFFU_API_KEY_WALLET_WITHDRAWAL!;
    const apiSecret = process.env.CEFFU_API_SECRET_WALLET_WITHDRAWAL!;

    const params: Record<string, any> = {
      amount: '50',
      coinSymbol: 'USDT',
      memo: '82486739',
      network: 'ETH',
      requestId: '1733136321861',
      timestamp: '1733136321861',
      walletId: '276251286620667904',
      withdrawalAddress: '0x168e3f5919fC3858D7911b3e302B826f0dE6B10b',
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

