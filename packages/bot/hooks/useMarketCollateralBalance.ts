import { type PubKey } from '@coinweb/wallet-lib';
import { type QueryFunction, useQuery } from '@tanstack/react-query';
import { type Pagination } from 'dex-app.cm';

import { getAllMarketCollateralBalance } from '../api';
import { type Currency } from '../constants';

type MarketBalanceQueryKey = ['marketCollateralBalance', Currency, PubKey | undefined, Pagination | undefined];

type Balance = string | null;

export const useMarketCollateralBalance = (l1Currency: Currency, pubKey?: PubKey | null, pagination?: Pagination) => {
  const queryKey: MarketBalanceQueryKey = ['marketCollateralBalance', l1Currency, pubKey ?? undefined, pagination];

  const queryFn: QueryFunction<Balance, MarketBalanceQueryKey> = async ({ queryKey }) => {
    const [, l1Currency, coinwebPubKey, pagination] = queryKey;

    if (!coinwebPubKey) return null;

    const data = await getAllMarketCollateralBalance(l1Currency, coinwebPubKey, pagination);

    return BigInt(data?.content?.fees_stored as bigint | string).toString();
  };

  return useQuery<Balance, Error, Balance, MarketBalanceQueryKey>({ queryKey, queryFn, refetchInterval: 30000 });
};
