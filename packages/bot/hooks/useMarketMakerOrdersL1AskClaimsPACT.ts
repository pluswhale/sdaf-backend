import { type PubKey } from '@coinweb/wallet-lib';
import { QueryFunction, useQuery } from '@tanstack/react-query';
import { type Pagination } from 'dex-app.cm';
import { REQUEST_EXECUTION_STATUS, type ExecutionRequest as MarketMakerPositionClaim } from 'market-maker.cm';

import { MarketOrderAskPACT } from '@/types';

import { getAllMarketClaim } from '../api';
import { Currency } from '../constants';

type MarketUserOrdersQueryKey = ['marketUserOrders', Currency, PubKey | undefined, Pagination | undefined];

type MarketUserOrders = MarketMakerPositionClaim[] | null;

const mockedPositions: MarketMakerPositionClaim[] = Array(5)
  .fill(null)
  .map(() => {
    return {
      id: '0xId',
      baseAmount: BigInt(Number(Math.random() * (4 - 1) + 4) * 10e18),
      quoteAmount: BigInt(Number(Math.random() * (0.2 - 0.1) + 0.1) * 10e18),
      collateral: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
      executionStatus: REQUEST_EXECUTION_STATUS.PENDING,
      fallbackContractId: 'fallBackId',
      fallbackMethodName: 'fallbackMethodName',
      requestedOrderId: '0xOrderId',
      quoteWallet: 'string',
      expirationDate: new Date().getTime(),
      createdAt: new Date().getTime(),
      txId: '0xTiId',
    } satisfies MarketMakerPositionClaim;
  });

export const useMarketMakerOrdersL1AskClaimsPACT = (
  l1Currency: Currency,
  pubKey?: PubKey | null,
  pagination?: Pagination,
) => {
  const queryKey: MarketUserOrdersQueryKey = ['marketUserOrders', l1Currency, pubKey ?? undefined, pagination];

  const queryFn: QueryFunction<MarketUserOrders, MarketUserOrdersQueryKey> = async ({ queryKey }) => {
    const [, l1Currency, coinwebPubKey, pagination] = queryKey;

    if (!coinwebPubKey) return null;

    const data = await getAllMarketClaim(l1Currency, coinwebPubKey, pagination);

    if ((window as CustomWindow).__MOCKS__ === true) {
      return data.concat(mockedPositions);
    }

    return data;
  };

  return useQuery<MarketUserOrders, Error, MarketUserOrders, MarketUserOrdersQueryKey>({
    queryKey,
    queryFn,
    refetchInterval: 10000,
  });
};

export const useMarketMakerOrdersL1AskClaimsPACTFormatted = (
  l1Currency: Currency,
  pubKey?: PubKey | null,
  pagination?: Pagination,
) => {
  const { data, ...rest } = useMarketMakerOrdersL1AskClaimsPACT(l1Currency, pubKey, pagination);

  if (!data) {
    return { ...rest, data: [] };
  }

  const formattedData: MarketOrderAskPACT[] = data.map((order) => {
    const baseCwebAmount = BigInt(order.baseAmount);
    const quoteL1Amount = BigInt(order.quoteAmount);
    const collateral = BigInt(order.collateral);

    return {
      id: order.id,
      baseCwebAmount,
      quoteL1Amount,
      collateral,
      orderId: order.requestedOrderId,
      quoteWallet: order.quoteWallet,
      createdAt: order.createdAt,
      expirationDate: order.expirationDate,
      status: order.executionStatus,
      fallbackContractId: order.fallbackContractId,
      fallbackMethodName: order.fallbackMethodName,
      l1Token: l1Currency,
      txId: order.txId,
    } satisfies MarketOrderAskPACT;
  });

  return {
    data: formattedData,
    ...rest,
  };
};
