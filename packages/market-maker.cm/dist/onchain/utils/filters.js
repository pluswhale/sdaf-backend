import { constructClaimKey, getContextGenesis, getContextSystem, } from '@coinweb/contract-kit';
import { toHex } from '../../offchain/shared/index.js';
import { createClosedOrderIndexKey } from '../../offchain/shared/keys/index.js';
import { CONSTANTS } from '../constants.js';
import { getInstanceParameters, getTime } from './context.js';
const { l2_shard_mining_time: miningTime } = getContextGenesis();
const getExpectedBlockHeight = (futureDate) => {
    const { block_height: currentHeight } = getContextSystem();
    const now = getTime();
    const miningPeriod = miningTime.secs * 1000 + miningTime.nanos / 1_000_000;
    if (now >= futureDate) {
        return currentHeight;
    }
    return currentHeight + Math.trunc((futureDate - now) / miningPeriod);
};
export const createExpirationClaimKey = (expirationDate) => constructClaimKey('L2BlockIdToHeightFirstPart', getExpectedBlockHeight(expirationDate));
export const createExpirationBlockFilter = (expirationDate) => {
    const { first_part: first, second_part: second } = createExpirationClaimKey(expirationDate);
    return {
        issuer: CONSTANTS.BLOCK_HEIGHT_INFO_PROVIDER,
        first,
        second,
    };
};
export const createClosedOrderBlockFilter = (issuer, id) => {
    const { first_part: first, second_part: second } = createClosedOrderIndexKey(id);
    return {
        issuer,
        first,
        second,
    };
};
export const createL1ExecuteEventClaimKey = (requestId, nonce) => {
    const parameters = getInstanceParameters();
    return constructClaimKey({
        l1_contract: parameters.l1_contract_address.toLowerCase(),
    }, {
        topics: [CONSTANTS.L1_EXECUTE_EVENT_SIGNATURE, requestId, toHex(nonce)],
    });
};
export const createL1ExecuteEventBlockFilter = (id, nonce) => {
    const { first_part: first, second_part: second } = createL1ExecuteEventClaimKey(id, nonce);
    return {
        issuer: CONSTANTS.L1_EVENT_INFO_PROVIDER,
        first,
        second,
    };
};
