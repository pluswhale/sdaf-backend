import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

const ASSETS = ['BTC', 'ETH', 'BNB', 'USDT'];

const priceCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export const getAssetPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const cachedPrices = priceCache.get<Record<string, number>>('prices');

    if (cachedPrices) {
      res.status(200).json({ prices: cachedPrices, source: 'cache' });
    }

    const prices = await fetchUsdPrices(ASSETS);

    priceCache.set('prices', prices);

    res.status(200).json({ prices, source: 'api' });
  } catch (error: any) {
    console.error('Error while getting asset prices:', error);
    res.status(500).json({ error: 'Unable to retrieve asset prices.' });
  }
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

export const fetchUsdPrices = async (assets: string[]): Promise<Record<string, number>> => {
  if (assets.length === 0) {
    throw new Error('Assets List is blank now.');
  }

  const ids = assets.map((asset) => mapAssetToCoinGeckoId(asset)).join(',');

  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids,
        vs_currencies: 'usd',
      },
    });

    const prices: Record<string, number> = {};
    for (const asset of assets) {
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

