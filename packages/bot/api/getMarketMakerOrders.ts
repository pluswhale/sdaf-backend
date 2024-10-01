import { type PubKey } from '@coinweb/wallet-lib';
import { type Client, getAllOwnOrders, type Pagination } from 'market-maker.cm';

import { Currency } from '../constants/index.ts';

import { makerClients } from './client.ts';

export const getMarketMakerOrders = async (currency: Currency, pubKey: PubKey, pagination?: Pagination) => {
  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get market maker orders for: ${currency}`);
  }

  const client: Client = {
    fetchClaims: (...params) => makerClients[currency].fetchClaims(...params, pagination),
  };

  return getAllOwnOrders(client, {
    auth: 'EcdsaContract',
    payload: pubKey,
  });
};
