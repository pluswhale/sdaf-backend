import { constructClaim } from '@coinweb/contract-kit';
import { createActiveOrderIndexKey, createBestOrderIndexKey, createOrderDateIndexKey, createOrderStateKey, createOrderCollateralKey, createOrderByOwnerIndexKey, toHex, createClosedOrderIndexKey, createBestActiveOrderIndexKey, createPendingOrderByOwnerIndexKey, } from '../../../offchain/shared/index.js';
import { createRateIndex } from '../dataConversions.js';
export const createOrderStateClaim = ({ id, body }) => constructClaim(createOrderStateKey(id), body, toHex(0));
export const createOrderCollateralClaim = ({ id, amount, owner }) => constructClaim(createOrderCollateralKey(id), {
    owner,
}, toHex(amount));
export const createOrderActiveIndexClaim = ({ timestamp, id }) => constructClaim(createActiveOrderIndexKey(timestamp, id), {}, toHex(0));
export const createOrderDateIndexClaim = ({ timestamp, id }) => constructClaim(createOrderDateIndexKey(timestamp, id), {}, toHex(0));
export const createBestOrderIndexClaim = ({ baseAmount, quoteAmount, id, }) => constructClaim(createBestOrderIndexKey(createRateIndex(baseAmount, quoteAmount), id), {}, toHex(0));
export const createBestActiveOrderIndexClaim = ({ baseAmount, quoteAmount, id, }) => constructClaim(createBestActiveOrderIndexKey(createRateIndex(baseAmount, quoteAmount), id), {}, toHex(0));
export const createOrderByOwnerIndexClaim = ({ user, timestamp, id, }) => constructClaim(createOrderByOwnerIndexKey(user, timestamp, id), {}, toHex(0));
export const createPendingOrderByOwnerIndexClaim = ({ user, timestamp, id, }) => constructClaim(createPendingOrderByOwnerIndexKey(user, timestamp, id), {}, toHex(0));
export const createClosedOrderIndexClaim = ({ id }) => constructClaim(createClosedOrderIndexKey(id), {}, toHex(0));
