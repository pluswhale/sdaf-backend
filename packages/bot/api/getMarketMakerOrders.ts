import { type PubKey } from '@coinweb/wallet-lib';
import { type Client, getAllOwnOrders, type Pagination } from 'market-maker.cm';
import { Currency } from '../constants';
import { makerClients } from './client';

export const getMarketMakerOrders = async (currency: Currency, pubKey: PubKey, pagination?: Pagination) => {

  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get market maker orders for: ${currency}`);
  }

  console.log('pubkey', pubKey);

  console.log('market client value', makerClients[currency]);

  const client: Client = {
    fetchClaims: (...params) => makerClients[currency].fetchClaims(...params, pagination),
  };


  // console.log('heellloo workld')

  return getAllOwnOrders(client, {
    auth: 'EcdsaContract',
    payload: pubKey,
  });
};
