import { constructBlock, constructContinueTx, constructRead, prepareQueueCall, queueCostFee, } from '@coinweb/contract-kit';
import { createOrderStateKey, createMakerDepositKey, createRequestStateKey, toHex, createRequestFundsKey, } from '../../../../../offchain/shared/index.js';
import { CONSTANTS, PRIVATE_METHODS } from '../../../../constants.js';
import { createExpirationBlockFilter, createExpirationClaimKey, createL1ExecuteEventBlockFilter, createL1ExecuteEventClaimKey, getContractIssuer, wrapWithJumpEventBlockFilter, wrapWithJumpEventClaimKey, wrapWithJumpEventIssuer, } from '../../../../utils/index.js';
export const constructCallWithL1Block = ({ context, requestId, orderId, nonce, providedCweb, authInfo, issuer, expirationDate, owner, }) => {
    const transactionFee = 1200n + queueCostFee();
    return constructContinueTx(context, [
        constructBlock([
            createExpirationBlockFilter(expirationDate),
            wrapWithJumpEventBlockFilter(createL1ExecuteEventBlockFilter(requestId, 0n), issuer),
        ]),
    ], [
        {
            callInfo: prepareQueueCall(getContractIssuer(context), {
                methodInfo: {
                    methodName: PRIVATE_METHODS.HANDLE_EXECUTION_BLOCK_TRIGGERED,
                    methodArgs: [requestId, orderId, toHex(nonce)],
                },
                contractInfo: {
                    providedCweb: providedCweb - transactionFee,
                    authenticated: authInfo,
                },
                contractArgs: [
                    constructRead(wrapWithJumpEventIssuer(), wrapWithJumpEventClaimKey(createL1ExecuteEventClaimKey(requestId, nonce), issuer)),
                    constructRead(CONSTANTS.BLOCK_HEIGHT_INFO_PROVIDER, createExpirationClaimKey(expirationDate)),
                    constructRead(issuer, createRequestStateKey(requestId)),
                    constructRead(issuer, createOrderStateKey(orderId)),
                    constructRead(issuer, createMakerDepositKey(owner)),
                    constructRead(issuer, createRequestFundsKey(requestId)),
                ],
            }),
        },
    ]);
};
