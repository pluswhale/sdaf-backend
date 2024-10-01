import { constructClaim, constructClaimKey } from '@coinweb/contract-kit';
import { createActivePositionIndexKey, createBestByQuoteIndexKey, createDateIndexKey, createPositionStateKey, createPositionFundsKey, createUserIndexKey, toHex, PositionFundsClaimBody, createClosedIndexKey, createOwnerKey, createBestByQuoteActiveIndexKey, } from '../../offchain/shared';
import { CONSTANTS } from '../constants';
import { L1Types } from '../types';
import { getExpectedBlockHeight, getInstanceParameters, getTime } from './contract';
import { createBestByQuoteIndex } from './dataConversion';
export const createPositionStateClaim = ({ id, body }) => constructClaim(createPositionStateKey(id), body, toHex(0));
export const createFundsClaim = ({ positionId, amount, owner, baseAmount, quoteAmount, }) => constructClaim(createPositionFundsKey(positionId), {
    owner,
    baseAmount,
    quoteAmount,
}, satisfies, PositionFundsClaimBody, toHex(amount));
export const createActiveIndexClaim = ({ timestamp, positionId }) => constructClaim(createActivePositionIndexKey(timestamp, positionId), {}, toHex(0));
export const createDateIndexClaim = ({ timestamp, positionId }) => constructClaim(createDateIndexKey(timestamp, positionId), {}, toHex(0));
export const createBestByQuoteIndexClaim = ({ baseAmount, quoteAmount, positionId, }) => constructClaim(createBestByQuoteIndexKey(createBestByQuoteIndex(baseAmount, quoteAmount), positionId), {}, toHex(0));
export const createBestByQuoteActiveIndexClaim = ({ baseAmount, quoteAmount, positionId, }) => constructClaim(createBestByQuoteActiveIndexKey(createBestByQuoteIndex(baseAmount, quoteAmount), positionId), {}, toHex(0));
export const createUserIndexClaim = ({ user, timestamp, positionId, }) => constructClaim(createUserIndexKey(user, timestamp, positionId), {}, toHex(0));
export const createClosedIndexClaim = ({ positionId }) => constructClaim(createClosedIndexKey(positionId), {}, toHex(0));
export const createOwnerClaim = ({ owner }) => constructClaim(createOwnerKey(), {
    owner,
    updatedAt: getTime(),
}, satisfies, OwnerClaimBody, toHex(0));
export const createEvmEventClaimKey = (positionId, nonce) => {
    const parameters = getInstanceParameters(L1Types.Evm);
    return constructClaimKey({
        l1_contract: parameters.l1_contract_address.toLowerCase(),
    }, {
        topics: [CONSTANTS.L1_ACCEPT_EVENT_SIGNATURE, positionId, toHex(nonce)],
    });
};
export const createExpirationPositionClaimKey = (expirationDate) => constructClaimKey('L2BlockIdToHeightFirstPart', getExpectedBlockHeight(expirationDate));
