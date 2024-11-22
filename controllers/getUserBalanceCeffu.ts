import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';

interface AssetBalance {
  asset: string;
  free: string;
  locked: string;
}

export const getUserBalance = async (req: Request, res: Response): Promise<void> => {
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

        const assets = assetsData.map((asset: any) => asset.asset);
        const usdPrices = await fetchUsdPrices(assets);

        let totalUsdValue = 0;
        const balances = assetsData.map((asset: any) => {
          const usdValue = parseFloat(asset.free) * (usdPrices[asset.asset] || 0);
          totalUsdValue += usdValue;
          return {
            asset: asset.asset,
            free: asset.free,
            locked: asset.locked,
            usdValue: usdValue.toFixed(2),
          };
        });

        res.status(200).json({ balances, totalUsdValue: totalUsdValue.toFixed(2) });
      } else {
        console.error('API Error:', response.data);
        res.status(500).json({ error: 'Failed to fetch balances' });
      }
    } catch (error: any) {
      console.error('Error fetching balances:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch balances' });
    }
  } catch (error: any) {
    console.error('Unexpected Error:', error.message);
    res.status(500).json({ error: 'An unexpected error occurred' });
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
  };
  return mapping[asset] || asset.toLowerCase();
};

