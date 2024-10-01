import type { User } from '@coinweb/wallet-lib';
import { type QueryFunction, useQuery } from '@tanstack/react-query';
import { type Pagination } from 'dex-app.cm';
import { type Order } from 'market-maker.cm';

import { type UIMarketOrderAsk } from '@/types';
import { calculateAmountFromRatio, calculateRatioFromBigInts } from '@/utils';

import { getActiveMarketOrders } from '../api';
import type { Currency } from '../constants';

import { useGetAllUsersPositions } from './useGetAllUsersPositions';

type MarketOrdersQueryKey = ['marketOrders', Currency, Pagination | undefined];

type MarketOrders = Order[] | null;

// MOCKS - start
const mockedOrders: Order[] = []
  .concat(
    // @ts-ignore
    [...Array(5)].map(() => ({
      id: `${Math.random() * 1000}`,
      recipient: '',
      baseAmount: BigInt(Number(Math.random() * (4 - 1) + 4) * 10e18),
      quoteAmount: BigInt(Number(Math.random() * (0.2 - 0.1) + 0.1) * 10e18),
      collateral: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
      covering: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
    })),
  )
  .concat(
    // @ts-ignore
    ([...Array(5)] as PositionData[]).map(() => ({
      id: `${Math.random() * 1000}`,
      recipient: '',
      baseAmount: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
      quoteAmount: BigInt(Number(Math.random() * (1 - 0.7) + 0.7) * 10e18),
      collateral: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
      covering: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
    })),
  );
// MOCKS - end

export const useMarketOrdersL1Ask = (currency: Currency, pagination?: Pagination) => {
  const queryKey: MarketOrdersQueryKey = ['marketOrders', currency, pagination];

  const queryFn: QueryFunction<MarketOrders, MarketOrdersQueryKey> = async ({ queryKey }) => {
    const [, currency, pagination] = queryKey;

    return await getActiveMarketOrders(currency, pagination).then((marketOrders) => {
      if ((window as CustomWindow).__MOCKS__ === true) {
        return (marketOrders || []).concat(mockedOrders);
      }

      return marketOrders;
    });
  };

  return useQuery<MarketOrders, Error, MarketOrders, MarketOrdersQueryKey>({
    queryKey,
    queryFn,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });
};

export const useMarketOrdersL1AskFormatted = (currency: Currency, pagination?: Pagination) => {
  const { data, ...rest } = useMarketOrdersL1Ask(currency, pagination);
  const { data: userPositionsData } = useGetAllUsersPositions(currency, pagination);

  if (!data) {
    return { ...rest, data: [] };
  }

  const formattedData: UIMarketOrderAsk[] = data.map((order) => {
    const tokenRatioL1ToCweb = calculateRatioFromBigInts(order.quoteAmount, order.baseAmount);

    const baseCwebAmount = BigInt(order.baseAmount);
    const quoteL1Amount = BigInt(order.quoteAmount);
    const remainingCwebAmount = BigInt(order.covering);
    const remainingL1Amount = calculateAmountFromRatio(order.covering, tokenRatioL1ToCweb);
    const remainingCollateral = BigInt(order.collateral);
    const isLoggedInUserPosition = !!userPositionsData?.find((position) => position.id === order.id);

    return {
      id: order.id,
      status: order.activityStatus,
      createdAt: order.createdAt,
      expirationDate: order.expirationDate,
      tokenRatioL1ToCweb,
      baseCwebAmount,
      quoteL1Amount,
      remainingCwebAmount,
      remainingL1Amount,
      remainingCollateral,
      l1Amount: order.l1Amount,
      owner: order.owner as User,
      baseWallet: order.baseRecipient.payload as string,
      l1Token: currency,
      txId: order.txId,
      isLoggedInUserPosition,
    } satisfies UIMarketOrderAsk;
  });

  return {
    data: formattedData,
    ...rest,
  };
};
