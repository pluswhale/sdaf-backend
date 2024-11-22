import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

interface AssetBalance {
  asset: string;
  free: string;
  locked: string;
}

export const getUserBalanceWithoutWalletId = async (req: Request, res: Response): Promise<void> => {
  try {
    const timestamp = Date.now().toString();
    const apiKeys = [
      { apiKey: process.env.CEFFU_API_KEY_BTC!, apiSecret: process.env.CEFFU_API_SECRET_BTC! },
      { apiKey: process.env.CEFFU_API_KEY_USDT!, apiSecret: process.env.CEFFU_API_SECRET_USDT! },
      { apiKey: process.env.CEFFU_API_KEY_BNB!, apiSecret: process.env.CEFFU_API_SECRET_BNB! },
    ];

    const balances = [];
    let totalUsdValue = 0;

    for (const keyPair of apiKeys) {
      const params = {
        timestamp,
        pageLimit: '500',
        pageNo: '1',
      };

      const queryString = new URLSearchParams(params).toString();
      const signature = signRequest(queryString, keyPair.apiSecret);

      const headers = {
        'open-apikey': keyPair.apiKey,
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

          break;
        }
      } catch (error: any) {
        console.error(`Error with API key ${keyPair.apiKey}:`, error.response?.data || error.message);
        continue;
      }
    }
  } catch (error: any) {
    console.error('Error fetching balances:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
};

const fetchCeffuBalance = async (apiKey: string, apiSecret: string, asset: string): Promise<AssetBalance> => {
  const timestamp = Date.now();
  const params = {
    timestamp,
    bizType: 10,
    walletType: 10,
  };

  const queryString = new URLSearchParams(params as any).toString();

  const signature = signRequest(queryString, apiSecret);

  const headers = {
    'open-apikey': apiKey,
    signature,
  };

  const endpoint = 'https://open-api.ceffu.com/open-api/v1/account';

  const response = await axios.get(endpoint, {
    headers,
    params,
  });

  const balances: AssetBalance[] = response.data.data.balances;
  const assetBalance = balances.find((b) => b.asset === asset);

  if (!assetBalance) {
    throw new Error(`Asset ${asset} not found in balances`);
  }

  return assetBalance;
};

import crypto from 'crypto';

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

