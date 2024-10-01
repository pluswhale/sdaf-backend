import { type PubKey } from '@coinweb/wallet-lib';
import { type Client, getAllOwnClaims, type Pagination } from 'market-maker.cm';
import { makerClients } from './client.ts';
import {Currency} from "../constants/index.ts";

export const getAllMarketClaim = async (currency: Currency, pubKey: PubKey, pagination?: Pagination) => {
  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get all market claim for: ${currency}`);
  }

  const client: Client = {
    fetchClaims: (...params) => makerClients[currency].fetchClaims(...params, pagination),
  };

  return getAllOwnClaims(client, {
    auth: 'EcdsaContract',
    payload: pubKey,
  });
};
