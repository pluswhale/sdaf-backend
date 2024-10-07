import { useEffect } from 'react';

import { type QueryFunction, useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import {Currency} from "../constants";


type CoingeckoTokenSlug = string;

type ValueOf<T> = T[keyof T];
type CoingeckoCoins = ValueOf<typeof COINGECKO_COINS>;

interface CoingeckoPrice {
  usd: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
  usd_24h_change?: number;
  last_updated_at?: number;
}

type CoingeckoPrices = {
  [K in CoingeckoCoins]: CoingeckoPrice;
};

type CoinPrice = {
  [key in Currency]: CoingeckoPrice;
};

type CoinPricesStore = {
  coinPrices: CoinPrice;
  error: Error | null;
  isLoading: boolean;
  setCoinPrices: (coinPrices: CoinPrice) => void;
  setError: (error: Error | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};

type CoingeckoPricesQueryKey = ['coingeckoPrices', { coins: string[]; fiats: string[] }];

const FIAT_CURRENCIES = ['usd'];

const COINGECKO_COINS: { [key in Currency]: CoingeckoTokenSlug } = {
  BNB: 'binancecoin',
  ETH: 'ethereum',
  BTC: 'bitcoin',
  USDT_BNB: 'tether',
  USDT_ETH: 'tether',
  LTC: 'litecoin',
  CWEB: 'coinweb',
  EGLD: 'elrond-erd-2',
};

const SLUG_TO_CURRENCY: { [key: CoingeckoTokenSlug]: Currency } = Object.fromEntries(
  Object.entries(COINGECKO_COINS).map(([currency, slug]) => [slug, currency as Currency]),
);

export const useCoingeckoPrices = () => {
  const { setCoinPrices, setError, setIsLoading } = useCoingeckoPricesStore();

  const queryKey: CoingeckoPricesQueryKey = [
    'coingeckoPrices',
    { coins: Object.values(COINGECKO_COINS), fiats: FIAT_CURRENCIES },
  ];

  const queryFn: QueryFunction<CoingeckoPrices, CoingeckoPricesQueryKey> = async ({ queryKey }) => {
    const [, { coins, fiats }] = queryKey;
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=${fiats.join(',')}`,
    );

    return response.json();
  };

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn,
    refetchOnMount: true,
    refetchInterval: (60 / 30) * 10 * 1000,
  });

  useEffect(() => {
    setIsLoading(isLoading);
    setError(error);

    if (!isLoading && !error && data) {
      const reversedValues = Object.fromEntries(
        Object.entries(data).reduce(
          (acc, cur) => {
            const [coingeckoTokenSlug, coingeckoPrices] = cur;

            if (coingeckoTokenSlug === 'tether') {
              return acc.concat([[Currency.USDT_BNB, coingeckoPrices]]).concat([[Currency.USDT_ETH, coingeckoPrices]]);
            }

            return acc.concat([[SLUG_TO_CURRENCY[coingeckoTokenSlug], coingeckoPrices]]);
          },
          [] as [Currency, CoingeckoPrice][],
        ),
      ) as CoinPrice;

      setCoinPrices(reversedValues);
    }
  }, [data, isLoading, error]);
};

const useCoingeckoPricesStore = create<CoinPricesStore>((set) => {
  return {
    coinPrices: Object.fromEntries(
      Object.entries(COINGECKO_COINS).map(([currency]) => [currency, { usd: 0 }]),
    ) as CoinPrice,
    error: null,
    isLoading: false,
    setError: (error) => set({ error }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setCoinPrices: (coinPrices) => set({ coinPrices }),
  };
});

export default useCoingeckoPricesStore;
