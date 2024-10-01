import { type Client, getBestActiveOrders, type Pagination } from 'market-maker.cm';

import { Currency } from '../constants/index.ts';

import { makerClients } from './client.ts';

export const getBestActiveMarketOrders = async (currency: Currency, pagination?: Pagination) => {
  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get best active market orders for: ${currency}`);
  }

  const client: Client = {
    fetchClaims: (...params) => makerClients[currency].fetchClaims(...params, pagination),
  };

  return getBestActiveOrders(client);
};
