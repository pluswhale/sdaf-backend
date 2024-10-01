import { getCallParameters, getContractIssuer, getMethodArguments, getReadClaimByIndex, parseL1EventData, unwrapEventClaim, } from '../../../utils/index.js';
import { constructCallWithL1Block } from '../handleExecutionRequest/utils/index.js';
import { handleExecution } from './handleExecution.js';
import { handleExpiration } from './handleExpiration.js';
export const handleExecutionBlockTriggered = (context) => {
    const { authInfo, availableCweb } = getCallParameters(context);
    const [requestId, orderId, nonce] = getMethodArguments(context);
    const issuer = getContractIssuer(context);
    const requestClaim = getReadClaimByIndex(context)(2);
    const orderClaim = getReadClaimByIndex(context)(3);
    const depositClaim = getReadClaimByIndex(context)(4);
    const requestFundsClaim = getReadClaimByIndex(context)(5);
    if (!requestClaim || !orderClaim || !depositClaim || !requestFundsClaim) {
        throw new Error('An unexpected error has occurred.');
    }
    const request = requestClaim.body;
    const order = orderClaim.body;
    const deposit = depositClaim.body;
    const depositAmount = depositClaim.fees_stored;
    const eventClaim = unwrapEventClaim(getReadClaimByIndex(context)(0));
    if (eventClaim) {
        const { paidAmount, recipient } = parseL1EventData(eventClaim.body.data);
        if (request.quoteWallet.toLowerCase() !== recipient.toLowerCase() ||
            BigInt(paidAmount) < BigInt(request.promisedQuoteAmount)) {
            //TODO! Add partially accept
            return [
                constructCallWithL1Block({
                    requestId,
                    orderId,
                    providedCweb: availableCweb,
                    authInfo,
                    context,
                    issuer,
                    nonce: BigInt(nonce) + 1n,
                    expirationDate: request.expirationDate,
                    owner: order.owner,
                }),
            ];
        }
        return handleExecution({
            context,
            issuer,
            orderId,
            orderState: order,
            providedCweb: availableCweb,
            requestId,
            requestState: request,
            depositAmount,
            depositOwner: deposit.owner,
        });
    }
    const expirationClaim = getReadClaimByIndex(context)(1);
    if (expirationClaim) {
        return handleExpiration({
            authInfo,
            context,
            providedCweb: availableCweb,
            requestId,
            orderId,
            requestFunds: requestFundsClaim.fees_stored,
            request,
            order,
        });
    }
    throw new Error(`An error has occurred while trying to process the request ${requestId}`);
};
