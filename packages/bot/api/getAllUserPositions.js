import { getUserPositionIds, getPositionById, } from 'dex-app.cm/src/offchain';
import { Currency } from '../constants';
import { baseClients } from './client';
export const getAllUserPositions = async (currency, pubKey, pagination) => {
    if (currency === Currency.CWEB) {
        throw new Error(`Cannot get user positions for: ${currency}`);
    }
    const client = {
        //@ts-ignore
        fetchClaims: (...params) => baseClients[currency].fetchClaims(...params, pagination),
    };
    const ids = await getUserPositionIds(client, {
        auth: 'EcdsaContract',
        payload: pubKey,
    });
    return Promise.all(ids.map((id) => getPositionById(client, id)));
};
