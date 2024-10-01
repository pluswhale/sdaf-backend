import { constructClaim } from '@coinweb/contract-kit';
import { toHex, createRequestStateKey, createRequestFundsKey, createRequestByOrderIndexKey, createRequestByMarketMakerIndexKey, } from '../../../offchain/shared/index.js';
export const createRequestStateClaim = ({ id, body }) => constructClaim(createRequestStateKey(id), body, toHex(0));
export const createRequestFundsClaim = ({ id, amount }) => constructClaim(createRequestFundsKey(id), {}, toHex(amount));
export const createRequestByOrderIndexClaim = ({ id, orderId, timestamp, }) => constructClaim(createRequestByOrderIndexKey(orderId, timestamp, id), {}, toHex(0));
export const createRequestByMarketMakerIndexClaim = ({ marketMaker, timestamp, id, }) => constructClaim(createRequestByMarketMakerIndexKey(marketMaker, timestamp, id), {}, toHex(0));
