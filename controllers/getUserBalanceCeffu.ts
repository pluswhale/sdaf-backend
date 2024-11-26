import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';

interface Asset {
  coinSymbol: string;
  network: string;
  amount: string;
  availableAmount: string;
  totalAmountWithMirror: string;
  usdValue: number;
}

export const getUserBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const timestamp = Date.now().toString();

    const apiKey = process.env.CEFFU_API_KEY_WALLET!;
    const apiSecret = process.env.CEFFU_API_SECRET_WALLET!;
    const walletId = '276251286620667904';

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

        const assetSymbols = assetsData.map((asset: Asset) => asset.coinSymbol);
        const prices = await fetchUsdPrices(assetSymbols);

        const assetsWithUsdValue = assetsData.map((asset: Asset) => {
          const usdValue = parseFloat(asset.availableAmount) * (prices[asset.coinSymbol] || 0);
          return { ...asset, usdValue };
        });

        const totalUsdValue = assetsWithUsdValue.reduce(
          (total: number, asset: Asset) => total + (asset.usdValue || 0),
          0,
        );
        res.status(200).json({
          balances: assetsWithUsdValue,
          totalUsdValue: totalUsdValue.toFixed(2),
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

const fetchUsdPrices = async (assets: string[]): Promise<Record<string, number>> => {
  const ids = assets.map((asset) => mapAssetToCoinGeckoId(asset)).join(',');
  const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
    params: {
      ids,
      vs_currencies: 'usd',
    },
  });

  const prices: Record<string, number> = {};
  for (const asset of assets) {
    const coinGeckoId = mapAssetToCoinGeckoId(asset);
    prices[asset] = response.data[coinGeckoId]?.usd || 0;
  }

  return prices;
};

const mapAssetToCoinGeckoId = (asset: string): string => {
  const mapping: Record<string, string> = {
    BTC: 'bitcoin',
    USDT: 'tether',
    BNB: 'binancecoin',
    ETH: 'ethereum',
  };
  return mapping[asset] || asset.toLowerCase();
};

