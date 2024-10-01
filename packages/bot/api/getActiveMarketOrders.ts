import { type Client, getAllActiveOrders, type Pagination } from 'market-maker.cm';

import { Currency } from '../constants/index.ts';

import { makerClients } from './client.ts';

export const getActiveMarketOrders = async (currency: Currency, pagination?: Pagination) => {
  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get active orders for: ${currency}`);
  }

  const client: Client = {
    fetchClaims: (...params) => makerClients[currency].fetchClaims(...params, pagination),
  };

  return getAllActiveOrders(client);
};
