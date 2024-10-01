import { type PubKey } from '@coinweb/wallet-lib';
import { type Client, getBalance, type Pagination } from 'market-maker.cm';


import { makerClients } from './client.ts';
import {Currency} from "../constants/index.ts";

export const getAllMarketCollateralBalance = async (currency: Currency, pubKey: PubKey, pagination?: Pagination) => {
  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get market balance for: ${currency}`);
  }

  const client: Client = {
    fetchClaims: (...params) => makerClients[currency].fetchClaims(...params, pagination),
  };

  return getBalance(client, {
    auth: 'EcdsaContract',
    payload: pubKey,
  });
};
