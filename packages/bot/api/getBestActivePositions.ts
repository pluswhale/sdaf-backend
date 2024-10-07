import { type Client, type Pagination, getPositionById, type PositionData, getBestActivePositionIds } from 'dex-app.cm/src/offchain';

import { Currency } from '../constants';

import { baseClients } from './client';

export const getBestActivePositions = async (currency: Currency, pagination?: Pagination): Promise<PositionData[]> => {
  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get best active positions for: ${currency}`);
  }

  const client: Client = {
    fetchClaims: (...params) => baseClients[currency].fetchClaims(...params, pagination),
  };

  const ids = await getBestActivePositionIds(client);

  return Promise.all(ids.map((id: string) => getPositionById(client, id)));
};
