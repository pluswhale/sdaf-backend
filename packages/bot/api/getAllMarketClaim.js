import { getAllOwnClaims } from 'market-maker.cm/src/offchain';
import { makerClients } from './client';
import { Currency } from "../constants";
export const getAllMarketClaim = async (currency, pubKey, pagination) => {
    if (currency === Currency.CWEB) {
        throw new Error(`Cannot get all market claim for: ${currency}`);
    }
    const client = {
        fetchClaims: (...params) => makerClients[currency].fetchClaims(...params, pagination),
    };
    return getAllOwnClaims(client, {
        auth: 'EcdsaContract',
        payload: pubKey,
    });
};
