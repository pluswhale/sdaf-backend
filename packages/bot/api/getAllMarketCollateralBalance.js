import { getBalance } from 'market-maker.cm/src/offchain';
import { makerClients } from './client';
import { Currency } from "../constants";
export const getAllMarketCollateralBalance = async (currency, pubKey, pagination) => {
    if (currency === Currency.CWEB) {
        throw new Error(`Cannot get market balance for: ${currency}`);
    }
    const client = {
        fetchClaims: (...params) => makerClients[currency].fetchClaims(...params, pagination),
    };
    return getBalance(client, {
        auth: 'EcdsaContract',
        payload: pubKey,
    });
};
