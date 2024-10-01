import { addContinuation, constructRead } from '@coinweb/contract-kit';
import { FEE, createMakerDepositKey } from '../../../../offchain/shared/index.js';
import { PRIVATE_METHODS } from '../../../constants.js';
import { getCallParameters, getContractIssuer, getContractRef, getMethodArguments, getUser } from '../../../utils/index.js';
export const depositPublic = (context) => {
    const { authInfo, availableCweb } = getCallParameters(context);
    const [depositAmount] = getMethodArguments(context);
    const amount = BigInt(depositAmount);
    const callFee = FEE.DEPOSIT;
    if (amount + callFee > availableCweb) {
        throw new Error('Insufficient cweb provided'); //TODO! Return a rest of cweb;
    }
    const issuer = getContractIssuer(context);
    const transactionFee = 900n;
    const callInfo = {
        ref: getContractRef(context),
        methodInfo: {
            methodName: PRIVATE_METHODS.DEPOSIT,
            methodArgs: [depositAmount],
        },
        contractInfo: {
            providedCweb: availableCweb - transactionFee,
            authenticated: authInfo,
        },
        contractArgs: [constructRead(issuer, createMakerDepositKey(getUser(context)))],
    };
    addContinuation(context, {
        onSuccess: callInfo,
    });
    return [];
};
