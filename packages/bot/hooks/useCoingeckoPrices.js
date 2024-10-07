import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { Currency } from "../constants";
const FIAT_CURRENCIES = ['usd'];
const COINGECKO_COINS = {
    BNB: 'binancecoin',
    ETH: 'ethereum',
    BTC: 'bitcoin',
    USDT_BNB: 'tether',
    USDT_ETH: 'tether',
    LTC: 'litecoin',
    CWEB: 'coinweb',
    EGLD: 'elrond-erd-2',
};
const SLUG_TO_CURRENCY = Object.fromEntries(Object.entries(COINGECKO_COINS).map(([currency, slug]) => [slug, currency]));
export const useCoingeckoPrices = () => {
    const { setCoinPrices, setError, setIsLoading } = useCoingeckoPricesStore();
    const queryKey = [
        'coingeckoPrices',
        { coins: Object.values(COINGECKO_COINS), fiats: FIAT_CURRENCIES },
    ];
    const queryFn = async ({ queryKey }) => {
        const [, { coins, fiats }] = queryKey;
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=${fiats.join(',')}`);
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
            const reversedValues = Object.fromEntries(Object.entries(data).reduce((acc, cur) => {
                const [coingeckoTokenSlug, coingeckoPrices] = cur;
                if (coingeckoTokenSlug === 'tether') {
                    return acc.concat([[Currency.USDT_BNB, coingeckoPrices]]).concat([[Currency.USDT_ETH, coingeckoPrices]]);
                }
                return acc.concat([[SLUG_TO_CURRENCY[coingeckoTokenSlug], coingeckoPrices]]);
            }, []));
            setCoinPrices(reversedValues);
        }
    }, [data, isLoading, error]);
};
const useCoingeckoPricesStore = create((set) => {
    return {
        coinPrices: Object.fromEntries(Object.entries(COINGECKO_COINS).map(([currency]) => [currency, { usd: 0 }])),
        error: null,
        isLoading: false,
        setError: (error) => set({ error }),
        setIsLoading: (isLoading) => set({ isLoading }),
        setCoinPrices: (coinPrices) => set({ coinPrices }),
    };
});
export default useCoingeckoPricesStore;
