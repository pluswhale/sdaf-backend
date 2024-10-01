import { type QueryFunction, useQuery } from '@tanstack/react-query';
import { type Pagination, type PositionData } from 'dex-app.cm';

import type { UIMarketOrderBid } from '@/types';
import { calculateAmountFromRatio, calculateRatioFromBigInts } from '@/utils';

import { getAllActivePositions } from '../api';
import { Currency } from '../constants';

import { useGetAllUsersPositions } from './useGetAllUsersPositions';

type AllPositionsQueryKey = ['allActivePositions', Currency, Pagination | undefined];

const mockedPositions: PositionData[] = []
  .concat(
    // @ts-ignore
    [...Array(5)].map(() => ({
      id: `${Math.random() * 1000}`,
      recipient: '',
      baseAmount: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
      quoteAmount: BigInt(Number(Math.random() * (0.3 - 0.1) + 0.1) * 10e18),
      activityStatus: 'ACTIVE',
      paymentStatus: 'PAYABLE',
      funds: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
      createdAt: new Date().getTime(),
    })),
  )
  .concat(
    // @ts-ignore
    ([...Array(5)] as PositionData[]).map(() => ({
      id: `${Math.random() * 1000}`,
      recipient: '',
      baseAmount: BigInt(Number(Math.random() * (50 - 20) + 20) * 10e18),
      quoteAmount: BigInt(Number(Math.random() * (1 - 0.7) + 0.7) * 10e18),
      activityStatus: 'ACTIVE',
      paymentStatus: 'PAYABLE',
      funds: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
      createdAt: new Date().getTime(),
    })),
  );

export const useMarketOrdersL1Bid = (currency: Currency, pagination?: Pagination) => {
  const queryKey: AllPositionsQueryKey = ['allActivePositions', currency, pagination];

  const queryFn: QueryFunction<PositionData[], AllPositionsQueryKey> = async ({ queryKey }) => {
    const [, currency, pagination] = queryKey;

    return getAllActivePositions(currency, pagination).then((marketPositions) => {
      if ((window as CustomWindow).__MOCKS__ === true) {
        return (marketPositions || []).concat(mockedPositions);
      }

      return marketPositions;
    });
  };

  return useQuery<PositionData[], Error, PositionData[], AllPositionsQueryKey>({
    queryKey,
    queryFn,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });
};

export const useMarketOrdersL1BidFormatted = (currency: Currency, pagination?: Pagination) => {
  const { data, ...rest } = useMarketOrdersL1Bid(currency, pagination);
  const { data: userPositionsData } = useGetAllUsersPositions(currency, pagination);

  if (!data) {
    return { data: [], ...rest };
  }

  const formattedData: UIMarketOrderBid[] = data.map((order) => {
    const tokenRatioL1ToCweb = calculateRatioFromBigInts(order.quoteAmount, order.baseAmount);
    const baseCwebAmount = BigInt(order.baseAmount);
    const quoteL1Amount = BigInt(order.quoteAmount);
    const remainingCwebAmount = BigInt(order.funds);
    const remainingL1Amount = calculateAmountFromRatio(order.funds, tokenRatioL1ToCweb);
    const isLoggedInUserPosition = !!userPositionsData?.find((position) => position.id === order.id);

    return {
      id: order.id,
      baseCwebAmount,
      quoteL1Amount,
      remainingCwebAmount,
      remainingL1Amount,
      tokenRatioL1ToCweb,
      createdAt: order.createdAt,
      recipientAddress: order.recipient,
      status: order.activityStatus,
      paymentStatus: order.paymentStatus,
      l1Token: currency,
      txId: order.txId,
      isLoggedInUserPosition,
    } satisfies UIMarketOrderBid;
  });

  return { data: formattedData, ...rest };
};
