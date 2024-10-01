import { addContinuation, constructRead } from '@coinweb/contract-kit';
import { createMakerDepositKey } from '../../../../offchain/shared/index.js';
import { PRIVATE_METHODS } from '../../../constants.js';
import { getCallParameters, getContractIssuer, getContractRef, getMethodArguments, getUser } from '../../../utils/index.js';
export const withdrawPublic = (context) => {
    const { authInfo, availableCweb } = getCallParameters(context);
    const [withdrawAmount] = getMethodArguments(context);
    const transactionFee = 900n;
    const callInfo = {
        ref: getContractRef(context),
        methodInfo: {
            methodName: PRIVATE_METHODS.WITHDRAW,
            methodArgs: [withdrawAmount],
        },
        contractInfo: {
            providedCweb: availableCweb - transactionFee,
            authenticated: authInfo,
        },
        contractArgs: [constructRead(getContractIssuer(context), createMakerDepositKey(getUser(context)))],
    };
    addContinuation(context, {
        onSuccess: callInfo,
    });
    return [];
};
