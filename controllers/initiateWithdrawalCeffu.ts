import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { signRequest } from './getUserBalanceCeffu';

dotenv.config();

export const initiateWithdrawalCeffu = async (req: Request, res: Response): Promise<any> => {
  try {
    const { amount, coinSymbol, network, withdrawalAddress, walletId, memo } = req.body;
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
      const orderViewId = response.data.data.data.orderViewId;
      const modifiedResponse = {
        code: response.data.code,
        orderViewId: orderViewId,
      };
      res.status(200).json({
        message: 'Withdrawal Initiated Successfully',
        data: modifiedResponse,
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

