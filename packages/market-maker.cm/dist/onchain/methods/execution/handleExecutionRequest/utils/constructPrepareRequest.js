import { addContinuation, constructRangeRead, constructRead } from '@coinweb/contract-kit';
import { createOrderStateFirstPart, createRequestStateKey, FEE, REQUEST_EXECUTION_STATUS, toHex, } from '../../../../../offchain/shared/index.js';
import { CONSTANTS, PRIVATE_METHODS } from '../../../../constants.js';
import { getContractIssuer, getContractRef, getTime, hashObject } from '../../../../utils/index.js';
export const constructPrepareRequestCall = ({ context, availableCweb, authInfo, requestedQuoteAmount, quoteWallet, fallbackContractId, fallbackMethodName, nonce, }) => {
    const transactionFee = 2000n;
    const issuer = getContractIssuer(context);
    const createdAt = getTime();
    const initialRequestData = {
        baseAmount: toHex(availableCweb - FEE.HANDLE_EXECUTION_REQUEST),
        createdAt,
        expirationDate: createdAt + CONSTANTS.REQUEST_LIFE_TIME,
        quoteWallet,
        requestedQuoteAmount,
        executionStatus: REQUEST_EXECUTION_STATUS.PENDING,
        fallbackContractId,
        fallbackMethodName,
        txId: context.call.txid,
    };
    const id = hashObject(initialRequestData, nonce);
    const callInfo = {
        ref: getContractRef(context),
        methodInfo: {
            methodName: PRIVATE_METHODS.PREPARE_EXECUTION_REQUEST,
            methodArgs: [id, initialRequestData],
        },
        contractInfo: {
            providedCweb: availableCweb - transactionFee,
            authenticated: authInfo,
        },
        contractArgs: [
            constructRead(issuer, createRequestStateKey(id)),
            constructRangeRead(issuer, createOrderStateFirstPart(), {}, 1000),
        ],
    };
    addContinuation(context, {
        onSuccess: callInfo,
    });
    return [];
};
