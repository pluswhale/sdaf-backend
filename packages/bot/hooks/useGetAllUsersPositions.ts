import { type QueryFunction, useQuery } from '@tanstack/react-query';
import { type Pagination, type PositionData } from 'dex-app.cm';

import { getAllUserPositions } from '../api';
import { Currency } from '../constants';

import { useUserPubKey } from './useUserPubKey';

type AllUsersPositionsQueryKey = ['allUsersPositions', Currency, Pagination | undefined];

export const useGetAllUsersPositions = (currency: Currency, pagination?: Pagination) => {
  const queryKey: AllUsersPositionsQueryKey = ['allUsersPositions', currency, pagination];
  const { pubKey } = useUserPubKey();

  const queryFn: QueryFunction<PositionData[], AllUsersPositionsQueryKey> = async ({ queryKey }) => {
    const [, currency, pagination] = queryKey;

    if (!pubKey) return [];

    return getAllUserPositions(currency, pubKey, pagination).then((marketPositions) => {
      return marketPositions;
    });
  };

  return useQuery<PositionData[], Error, PositionData[], AllUsersPositionsQueryKey>({
    queryKey,
    queryFn,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });
};
