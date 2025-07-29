import axios from 'axios';
import axiosRetry from 'axios-retry';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as dotenv from 'dotenv';
import NodeCache from 'node-cache';

dotenv.config();

const priceCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const api = axios.create({
  baseURL: 'https://pro-api.coingecko.com/api/v3/',
  timeout: 5000,
});

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return error.response?.status === 500 || error.code === 'ECONNABORTED';
  },
});

export const getAssetPrice: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cachedPrices = priceCache.get<Record<string, number>>('prices');

    if (cachedPrices) {
      res.status(200).json({ prices: cachedPrices, source: 'cache' });
      return;
    }

    console.log('Fetching prices from API...');
    const prices = await fetchUsdPrices();
    console.log('Prices fetched:', prices);

    priceCache.set('prices', prices);

    res.status(200).json({ prices, source: 'api' });
    return;
  } catch (error: any) {
    console.error('Error while getting asset prices:', error);
    if (!res.headersSent) {
      console.log('Sending error response');
      res.status(500).json({ error: 'Unable to retrieve asset prices.' });
      return;
    }
    next(error);
  }
};

const mapAssetToCoinGeckoId = (asset: string): string => {
  const mapping: Record<string, string> = {
    BTC: 'bitcoin',
    LTC: 'litecoin',
    USDT: 'tether',
    USDC: 'usd-coin',
    USD1: 'usd1-wlfi',
    BNB: 'binancecoin',
    ETH: 'ethereum',
    TRX: 'tron',
    WBTC: 'wrapped-bitcoin',
    WBTC_BNB: 'berachain-bridged-wbtc-berachain',
    POL: 'polygon-ecosystem-token',
  };
  return mapping[asset] || asset.toLowerCase();
};

export const fetchUsdPrices = async (): Promise<Record<string, number>> => {
  const ASSETS = ['BTC', 'ETH', 'BNB', 'USDT', 'USDC', 'USD1', 'TRX', 'WBTC', 'WBTC_BNB', 'LTC', 'POL'];

  if (ASSETS.length === 0) {
    throw new Error('Assets List is blank now.');
  }

  const ids = ASSETS.map((asset) => mapAssetToCoinGeckoId(asset)).join(',');

  try {
    const response = await api.get('simple/price', {
      params: {
        ids,
        vs_currencies: 'usd',
        x_cg_pro_api_key: process.env.COINGEKO_PRO_API_KEY,
      },
    });

    const prices: Record<string, number> = {};
    for (const asset of ASSETS) {
      const coinId = mapAssetToCoinGeckoId(asset);
      if (response.data[coinId] && response.data[coinId].usd !== undefined) {
        prices[asset] = response.data[coinId].usd;
      } else {
        prices[asset] = 0;
      }
    }

    return prices;
  } catch (error: any) {
    console.error('Error while requesting CoinGecko API:', error);
    throw new Error('Unable to retrieve asset prices.');
  }
};
