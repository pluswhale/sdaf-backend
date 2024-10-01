import { getCallParameters, getMethodArguments } from '../../../utils/index.js';
import { constructPrepareRequestCall } from './utils/index.js';
export const handleExecutionRequestPublic = (context) => {
    const { authInfo, availableCweb } = getCallParameters(context);
    const [requestedQuoteAmount, quoteWallet, fallbackContractId, fallbackMethodName] = getMethodArguments(context);
    return constructPrepareRequestCall({
        context,
        authInfo,
        availableCweb,
        requestedQuoteAmount,
        quoteWallet,
        fallbackContractId,
        fallbackMethodName,
    });
};
