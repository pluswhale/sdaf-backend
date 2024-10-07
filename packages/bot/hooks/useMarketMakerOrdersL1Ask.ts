import { User, type PubKey } from '@coinweb/wallet-lib';
import { type QueryFunction, useQuery } from '@tanstack/react-query';
import { type Pagination } from 'dex-app.cm';
import { type Order } from 'market-maker.cm';


import { getMarketMakerOrders } from '../api';
import { Currency } from '../constants';
import {UIMarketOrderAsk} from "../types";
import {calculateAmountFromRatio, calculateRatioFromBigInts} from "../utils";

type MarketMakerOrdersQueryKey = ['marketMakerOrders', Currency, PubKey | undefined, Pagination | undefined];

type MarketMakerOrders = Order[] | null;

export const useMarketMakerOrdersL1Ask = (currency: Currency, pubKey?: PubKey | null, pagination?: Pagination) => {
  const queryKey: MarketMakerOrdersQueryKey = ['marketMakerOrders', currency, pubKey ?? undefined, pagination];

  const queryFn: QueryFunction<MarketMakerOrders, MarketMakerOrdersQueryKey> = async ({ queryKey }) => {
    const [, currency, coinwebPubKey, pagination] = queryKey;

    if (!coinwebPubKey) return null;

    return await getMarketMakerOrders(currency, coinwebPubKey, pagination);
  };

  return useQuery<MarketMakerOrders, Error, MarketMakerOrders, MarketMakerOrdersQueryKey>({
    queryKey,
    queryFn,
    refetchInterval: 10000,
  });
};

export const useMarketMakerOrdersL1AskFormatted = (
  currency: Currency,
  pubKey?: PubKey | null,
  pagination?: Pagination,
) => {
  const { data, ...rest } = useMarketMakerOrdersL1Ask(currency, pubKey, pagination);

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
    } satisfies UIMarketOrderAsk;
  });

  return {
    data: formattedData,
    ...rest,
  };
};
