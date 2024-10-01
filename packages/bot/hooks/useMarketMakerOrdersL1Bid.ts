import { type PubKey } from '@coinweb/wallet-lib';
import { type QueryFunction, useQuery } from '@tanstack/react-query';
import { type Pagination, type PositionData } from 'dex-app.cm';

import type { UIMarketOrderBid } from '@/types';
import { calculateAmountFromRatio, calculateRatioFromBigInts } from '@/utils';

import { getAllUserPositions } from '../api';
import { type Currency } from '../constants';

type UserPositionsQueryKey = ['userPositions', Currency, PubKey | undefined, Pagination | undefined];

export const useMarketMakerOrdersL1Bid = (currency: Currency, pubKey?: PubKey | null, pagination?: Pagination) => {
  const queryKey: UserPositionsQueryKey = ['userPositions', currency, pubKey ?? undefined, pagination];

  const queryFn: QueryFunction<PositionData[], UserPositionsQueryKey> = async ({ queryKey }) => {
    const [, currency, pubKey, pagination] = queryKey;

    if (!pubKey) {
      return [];
    }

    return getAllUserPositions(currency, pubKey, pagination);
  };

  return useQuery<PositionData[], Error, PositionData[], UserPositionsQueryKey>({
    queryKey,
    queryFn,
    refetchInterval: 10000,
  });
};

export const useMarketMakerOrdersL1BidFormatted = (
  currency: Currency,
  pubKey?: PubKey | null,
  pagination?: Pagination,
) => {
  const { data, ...rest } = useMarketMakerOrdersL1Bid(currency, pubKey, pagination);

  if (!data) {
    return { ...rest, data: [] };
  }

  const formattedData: UIMarketOrderBid[] = data.map((order) => {
    const tokenRatioL1ToCweb = calculateRatioFromBigInts(order.quoteAmount, order.baseAmount);
    const baseCwebAmount = BigInt(order.baseAmount);
    const quoteL1Amount = BigInt(order.quoteAmount);
    const remainingCwebAmount = BigInt(order.funds);
    const remainingL1Amount = calculateAmountFromRatio(order.funds, tokenRatioL1ToCweb);

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
      chainData: order.chainData,
      txId: order.txId,
      error: order.error,
    } satisfies UIMarketOrderBid;
  });

  return { ...rest, data: formattedData };
};
