import { addContinuation, constructBlock, constructContinueTx, constructContractRef, constructRead, prepareQueueCall, queueCostFee, sendCwebInterface, } from '@coinweb/contract-kit';
import { createClosedIndexKey, createOwnerKey, createPositionFundsKey, createPositionStateKey, toHex, } from '../../offchain/shared';
import { CONSTANTS, PRIVATE_METHODS } from '../constants';
import { createExpirationPositionClaimKey } from './claims';
import { createClosedPositionBlockFilter, createExpirationPositionBlockFilter, createL1AcceptEventBlockFilter, } from './filters';
import { wrapWithJumpEventBlockFilter, wrapWithJumpEventClaimKey, wrapWithJumpEventIssuer } from './jumps';
export const createCreatePositionCallPrivate = (context, issuer, positionId, methodArgs, providedCweb, authenticated) => {
    const transactionFee = 1000n;
    addContinuation(context, {
        onSuccess: {
            ref: constructContractRef(issuer, []),
            methodInfo: {
                methodName: PRIVATE_METHODS.CREATE_POSITION,
                methodArgs,
            },
            contractInfo: {
                providedCweb: providedCweb - transactionFee,
                authenticated,
            },
            contractArgs: [
                constructRead(issuer, createPositionStateKey(positionId)),
                constructRead(issuer, createOwnerKey()),
            ],
        },
    });
    return [];
};
export const createCallWithL1EventBlock = (context, { authenticated, eventClaimKey, eventNonce, issuer, methodName, positionId, positionState, providedCweb, withExpiration, }) => {
    return constructContinueTx(context, [
        constructBlock([
            wrapWithJumpEventBlockFilter(createL1AcceptEventBlockFilter(eventClaimKey), issuer),
            createClosedPositionBlockFilter(issuer, positionId),
            ...(withExpiration ? [createExpirationPositionBlockFilter(positionState.expirationDate)] : []),
        ]),
    ], [
        {
            callInfo: prepareQueueCall(issuer, {
                methodInfo: {
                    methodName,
                    methodArgs: [positionId, eventNonce === null ? eventNonce : toHex(eventNonce), positionState],
                },
                contractInfo: {
                    providedCweb: providedCweb - queueCostFee(),
                    authenticated,
                },
                contractArgs: [
                    constructRead(wrapWithJumpEventIssuer(), wrapWithJumpEventClaimKey(eventClaimKey, issuer)),
                    constructRead(issuer, createPositionFundsKey(positionId)),
                    constructRead(issuer, createPositionStateKey(positionId)),
                    constructRead(CONSTANTS.BLOCK_HEIGHT_INFO_PROVIDER, createExpirationPositionClaimKey(positionState.expirationDate)),
                    constructRead(issuer, createClosedIndexKey(positionId)),
                ],
            }),
        },
    ]);
};
export const { constructSendCweb } = sendCwebInterface();
export const constructConditional = ((condition, ops, altOps = []) => {
    if (!condition) {
        if (Array.isArray(altOps)) {
            return altOps;
        }
        return [altOps];
    }
    if (Array.isArray(ops)) {
        return ops;
    }
    return [ops];
});
