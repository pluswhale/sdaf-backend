import { constructContractIssuer, constructContractRef, getContextSystem, } from '@coinweb/contract-kit';
import { CONSTANTS } from '../constants';
import { getInstanceParameters } from './contract';
import { createL1AcceptEventBlockFilter } from './filters';
export const wrapWithJumpEventClaimKey = (claimKey, issuer) => {
    const { shard: currentShard } = getContextSystem();
    const { shard: eventShard } = getInstanceParameters();
    if (currentShard === eventShard) {
        return claimKey;
    }
    return {
        first_part: issuer,
        second_part: [
            eventShard,
            {
                issuer: CONSTANTS.L1_EVENT_INFO_PROVIDER,
                first: claimKey.first_part,
                second: claimKey.second_part,
            },
        ],
    };
};
export const wrapWithJumpEventIssuer = () => {
    const { shard: currentShard } = getContextSystem();
    const { shard: eventShard } = getInstanceParameters();
    if (currentShard === eventShard) {
        return CONSTANTS.L1_EVENT_INFO_PROVIDER;
    }
    return constructContractIssuer(CONSTANTS.JUMP_CONTRACT_ID);
};
export const wrapWithJumpEventBlockFilter = (filter, issuer) => {
    const { shard: currentShard } = getContextSystem();
    const { shard: eventShard } = getInstanceParameters();
    if (currentShard === eventShard) {
        return filter;
    }
    return {
        issuer: constructContractIssuer(CONSTANTS.JUMP_CONTRACT_ID),
        first: issuer,
        second: [eventShard, filter],
    };
};
export const constructJumpCall = (claimKey, providedCweb) => {
    const { shard: currentShard } = getContextSystem();
    const { shard: eventShard } = getInstanceParameters();
    if (currentShard === eventShard) {
        return [];
    }
    return [
        {
            callInfo: {
                ref: constructContractRef(constructContractIssuer(CONSTANTS.JUMP_CONTRACT_ID), []),
                methodInfo: {
                    methodName: CONSTANTS.JUMP_CONTRACT_METHOD,
                    methodArgs: [eventShard, createL1AcceptEventBlockFilter(claimKey)],
                },
                contractInfo: {
                    providedCweb,
                    authenticated: null,
                },
                contractArgs: [],
            },
        },
    ];
};
export const unwrapEventClaim = (claim) => {
    const { shard: currentShard } = getContextSystem();
    const { shard: eventShard } = getInstanceParameters();
    if (!claim || currentShard === eventShard) {
        return claim;
    }
    return claim.body[0].content;
};
