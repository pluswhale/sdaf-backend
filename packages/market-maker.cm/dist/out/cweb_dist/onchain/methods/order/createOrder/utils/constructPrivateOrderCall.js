import { addContinuation, constructContractRef, constructRead, } from '@coinweb/contract-kit';
import { createOrderStateKey, createMakerDepositKey } from '../../../../../offchain/shared/index.js';
import { PRIVATE_METHODS } from '../../../../constants.js';
import { getUser } from '../../../../utils/index.js';
export const constructPrivateOrderCall = (context, issuer, orderId, orderInitialState, providedCweb, authenticated) => {
    const transactionFee = 1000n;
    const callInfo = {
        ref: constructContractRef(issuer, []),
        methodInfo: {
            methodName: PRIVATE_METHODS.CREATE_ORDER,
            methodArgs: [orderId, orderInitialState],
        },
        contractInfo: {
            providedCweb: providedCweb - transactionFee,
            authenticated,
        },
        contractArgs: [
            constructRead(issuer, createOrderStateKey(orderId)),
            constructRead(issuer, createMakerDepositKey(getUser(context))),
        ],
    };
    addContinuation(context, {
        onSuccess: callInfo,
    });
    return [];
};
