import { getPositionById, getActivePositionIds } from 'dex-app.cm/src/offchain';
import { Currency } from '../constants';
import { baseClients } from './client';
export const getAllActivePositions = async (currency, pagination) => {
    if (currency === Currency.CWEB) {
        throw new Error(`Cannot get active positions for: ${currency}`);
    }
    const client = {
        // @ts-ignore
        fetchClaims: (...params) => baseClients[currency].fetchClaims(...params, pagination),
    };
    const ids = await getActivePositionIds(client);
    return Promise.all(ids.map((id) => getPositionById(client, id)));
};
