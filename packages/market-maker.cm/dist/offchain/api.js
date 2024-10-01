import { createActiveOrderIndexFirstPart, createBestActiveOrderIndexFirstPart, createBestOrderIndexFirstPart, createMakerDepositFirstPart, createOrderByOwnerIndexFirstPart, createOrderStateKey, createRequestByMarketMakerIndexFirstPart, createRequestStateKey, } from './shared/index.js';
export const getOrderById = async (client, id) => {
    const key = createOrderStateKey(id);
    const claimResponse = (await client.fetchClaims(key.first_part, key.second_part))[0];
    if (!claimResponse) {
        throw new Error('Order not found');
    }
    const data = claimResponse.content.body;
    return {
        ...data,
        id,
        baseAmount: BigInt(data.baseAmount),
        quoteAmount: BigInt(data.l1Amount),
        collateral: BigInt(data.collateral),
        covering: BigInt(data.covering),
    };
};
export const getClaimById = async (client, id) => {
    const key = createRequestStateKey(id);
    const claimResponse = (await client.fetchClaims(key.first_part, key.second_part))[0];
    if (!claimResponse) {
        throw new Error('Claim not found');
    }
    const data = claimResponse.content.body;
    const { createdAt, executionStatus, expirationDate, fallbackContractId, fallbackMethodName, quoteWallet, requestedOrderId, txId, } = data;
    return {
        id,
        baseAmount: BigInt(data.baseAmount),
        quoteAmount: BigInt(data.promisedQuoteAmount),
        collateral: BigInt(data.collateral),
        createdAt,
        executionStatus,
        expirationDate,
        fallbackContractId,
        fallbackMethodName,
        quoteWallet,
        requestedOrderId,
        txId,
    };
};
export const getAllOwnOrdersIds = async (client, owner) => {
    const claimsResponse = await client.fetchClaims(createOrderByOwnerIndexFirstPart(owner), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getAllOwnClaimIds = async (client, owner) => {
    const claimsResponse = await client.fetchClaims(createRequestByMarketMakerIndexFirstPart(owner), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getAllActiveOrdersIds = async (client) => {
    const claimsResponse = await client.fetchClaims(createActiveOrderIndexFirstPart(), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getBestOrdersIds = async (client) => {
    const claimsResponse = await client.fetchClaims(createBestOrderIndexFirstPart(), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getBestActiveOrdersIds = async (client) => {
    const claimsResponse = await client.fetchClaims(createBestActiveOrderIndexFirstPart(), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getAllOwnOrders = async (client, owner) => {
    const ids = await getAllOwnOrdersIds(client, owner);
    const orders = await Promise.all(ids.map((id) => getOrderById(client, id)));
    return orders;
};
export const getAllOwnClaims = async (client, owner) => {
    const ids = await getAllOwnClaimIds(client, owner);
    const claims = await Promise.all(ids.map((id) => getClaimById(client, id)));
    return claims;
};
export const getAllActiveOrders = async (client) => {
    const ids = await getAllActiveOrdersIds(client);
    const orders = await Promise.all(ids.map((id) => getOrderById(client, id)));
    return orders;
};
export const getBestOrders = async (client) => {
    const ids = await getBestOrdersIds(client);
    const orders = await Promise.all(ids.map((id) => getOrderById(client, id)));
    return orders;
};
export const getBestActiveOrders = async (client) => {
    const ids = await getBestActiveOrdersIds(client);
    const orders = await Promise.all(ids.map((id) => getOrderById(client, id)));
    return orders;
};
export const getBalance = async (client, owner) => {
    const claimsResponse = await client.fetchClaims(createMakerDepositFirstPart(), [owner]);
    return claimsResponse[0];
};
