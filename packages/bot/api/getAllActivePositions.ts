import { type Client, type Pagination, getPositionById, getActivePositionIds, type PositionData } from 'dex-app.cm/src/offchain';

import { Currency } from '../constants';

import { baseClients } from './client';

export const getAllActivePositions = async (currency: Currency, pagination?: Pagination): Promise<PositionData[]> => {
  if (currency === Currency.CWEB) {
    throw new Error(`Cannot get active positions for: ${currency}`);
  }

  const client: Client = {
    // @ts-ignore
    fetchClaims: (...params: any) => baseClients[currency].fetchClaims(...params, pagination),
  };

  const ids = await getActivePositionIds(client);

  return Promise.all(ids.map((id: string) => getPositionById(client, id)));
};
