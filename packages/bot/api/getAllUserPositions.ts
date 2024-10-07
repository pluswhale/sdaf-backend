import {
  type Client,
  type Pagination,
  type PositionData,
  getUserPositionIds,
  getPositionById,
  type PubKey,
} from 'dex-app.cm/src/offchain';

import { Currency } from '../constants';

import { baseClients } from './client';

export const getAllUserPositions = async (
  currency: Currency,
  pubKey: PubKey,
  pagination?: Pagination,
): Promise<PositionData[]> => {
  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get user positions for: ${currency}`);
  }

  const client: Client = {
    //@ts-ignore
    fetchClaims: (...params: any) => baseClients[currency].fetchClaims(...params, pagination),
  };

  const ids = await getUserPositionIds(client, {
    auth: 'EcdsaContract',
    payload: pubKey,
  });

  return Promise.all(ids.map((id: string) => getPositionById(client, id)));
};
