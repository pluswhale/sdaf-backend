import { createActivePositionIndexFirstPart, createBestByQuoteActiveIndexFirstPart, createBestByQuoteIndexFirstPart, createDateIndexFirstPart, createPositionStateKey, createUserIndexFirstPart, } from './shared/keys';
export const getActivePositionIds = async (client) => {
    const claimsResponse = await client.fetchClaims(createActivePositionIndexFirstPart(), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getBestPositionIds = async (client) => {
    const claimsResponse = await client.fetchClaims(createBestByQuoteIndexFirstPart(), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getBestActivePositionIds = async (client) => {
    const claimsResponse = await client.fetchClaims(createBestByQuoteActiveIndexFirstPart(), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getLastPositionIds = async (client) => {
    const claimsResponse = await client.fetchClaims(createDateIndexFirstPart(), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getUserPositionIds = async (client, user) => {
    const claimsResponse = await client.fetchClaims(createUserIndexFirstPart(user), null);
    return claimsResponse.map(({ content }) => content.key.second_part[1]);
};
export const getPositionById = async (client, id) => {
    const key = createPositionStateKey(id);
    const claimResponse = (await client.fetchClaims(key.first_part, key.second_part))[0];
    if (!claimResponse) {
        throw new Error('Position not found');
    }
    const data = claimResponse.content.body;
    return {
        id,
        baseAmount: BigInt(data.baseAmount),
        quoteAmount: BigInt(data.quoteAmount),
        recipient: data.recipient,
        createdAt: data.createdAt,
        activityStatus: data.activityStatus,
        paymentStatus: data.paymentStatus,
        funds: BigInt(data.funds),
        chainData: data.chainData,
        txId: data.txId,
    };
    satisfies;
    PositionData;
};
