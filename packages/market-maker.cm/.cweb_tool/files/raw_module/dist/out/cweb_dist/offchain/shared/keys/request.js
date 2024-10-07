import { Key } from '../constants';
export const createRequestStateFirstPart = () => [Key.REQUEST_STATE];
export const createRequestFundsFirstPart = () => [Key.REQUEST_FUNDS];
export const createRequestByOrderIndexFirstPart = (orderId) => [Key.REQUEST_BY_ORDER_INDEX, orderId];
export const createRequestByMarketMakerIndexFirstPart = (marketMaker) => [
    Key.REQUEST_BY_MAKER_INDEX,
    marketMaker,
];
export const createRequestStateKey = (id) => ({
    first_part: createRequestStateFirstPart(),
    second_part: [id],
});
export const createRequestFundsKey = (id) => ({
    first_part: createRequestFundsFirstPart(),
    second_part: [id],
});
export const createRequestByOrderIndexKey = (orderId, timestamp, requestId) => ({
    first_part: createRequestByOrderIndexFirstPart(orderId),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, requestId],
});
export const createRequestByMarketMakerIndexKey = (marketMaker, timestamp, requestId) => ({
    first_part: createRequestByMarketMakerIndexFirstPart(marketMaker),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, requestId],
});
