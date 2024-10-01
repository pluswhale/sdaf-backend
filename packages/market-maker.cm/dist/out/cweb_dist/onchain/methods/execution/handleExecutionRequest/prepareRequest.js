import { constructContinueTx, constructContractIssuer, constructContractRef, constructRead, constructStore, constructTake, extractContractArgs, extractRead, passCwebFrom, prepareQueueCall, queueCostFee, } from '@coinweb/contract-kit';
import { createActiveOrderIndexKey, createBestActiveOrderIndexKey, createOrderCollateralKey, ORDER_ACTIVITY_STATUS, toHex, } from '../../../../offchain/shared/index.js';
import { PRIVATE_METHODS } from '../../../constants.js';
import { createOrderStateClaim, createPendingOrderByOwnerIndexClaim, createRateIndex, getCallParameters, getContractIssuer, getMethodArguments, getReadClaimByIndex, } from '../../../utils/index.js';
import { constructPrepareRequestCall } from './utils/index.js';
const calculateRate = (base, quote) => {
    return BigInt(Number(quote) * 1e18) / BigInt(base);
};
export const prepareRequest = (context) => {
    const { authInfo, availableCweb } = getCallParameters(context);
    const [requestId, initialRequestData] = getMethodArguments(context);
    const existingClaim = getReadClaimByIndex(context)(2);
    if (existingClaim) {
        return constructPrepareRequestCall({
            ...initialRequestData,
            context,
            authInfo,
            availableCweb,
            nonce: requestId,
        });
    }
    const orderClaims = extractRead(extractContractArgs(context.tx)[1])?.map(({ content }) => content);
    const requestRate = calculateRate(initialRequestData.baseAmount, initialRequestData.requestedQuoteAmount);
    const orderClaimFilter = orderClaims?.filter((orderClaim) => orderClaim.body.activityStatus === ORDER_ACTIVITY_STATUS.ACTIVE &&
        BigInt(orderClaim.body.covering) >= BigInt(initialRequestData.baseAmount) &&
        calculateRate(orderClaim.body.baseAmount, orderClaim.body.l1Amount) >= requestRate) ?? [];
    const orderClaim = orderClaimFilter.length > 0
        ? orderClaimFilter.reduce((selectedOrderClaim, candidateOrderClaim) => {
            const selectedRate = calculateRate(selectedOrderClaim.body.baseAmount, selectedOrderClaim.body.l1Amount);
            const candidateRate = calculateRate(candidateOrderClaim.body.baseAmount, candidateOrderClaim.body.l1Amount);
            if (selectedRate < candidateRate) {
                return candidateOrderClaim;
            }
            else {
                return selectedOrderClaim;
            }
        })
        : undefined;
    const promisedQuoteAmount = orderClaim
        ? (BigInt(initialRequestData.baseAmount) * BigInt(orderClaim?.body.l1Amount)) / BigInt(orderClaim?.body.baseAmount)
        : null;
    if (!orderClaim || !promisedQuoteAmount) {
        const transactionFee = 900n + queueCostFee();
        return [
            constructContinueTx(context, [], [
                {
                    callInfo: prepareQueueCall(constructContractIssuer(initialRequestData.fallbackContractId), {
                        methodInfo: {
                            methodName: initialRequestData.fallbackMethodName,
                            methodArgs: [initialRequestData.requestedQuoteAmount, initialRequestData.quoteWallet],
                        },
                        contractInfo: {
                            providedCweb: availableCweb - transactionFee,
                            authenticated: null,
                        },
                        contractArgs: [],
                    }),
                },
            ]),
        ];
    }
    const orderState = { ...orderClaim.body, activityStatus: ORDER_ACTIVITY_STATUS.PENDING };
    const [orderId] = orderClaim.key.second_part;
    const issuer = getContractIssuer(context);
    const transactionFee = 1300n;
    return [
        constructContinueTx(context, [
            passCwebFrom(issuer, availableCweb),
            constructTake(createActiveOrderIndexKey(orderState.createdAt, orderId)),
            constructTake(createBestActiveOrderIndexKey(createRateIndex(orderState.baseAmount, orderState.l1Amount), orderId)),
            constructStore(createOrderStateClaim({
                id: orderId,
                body: orderState,
            })),
            constructStore(createPendingOrderByOwnerIndexClaim({
                user: orderState.owner,
                id: orderId,
                timestamp: initialRequestData.createdAt,
            })),
        ], [
            {
                callInfo: {
                    ref: constructContractRef(issuer, []),
                    methodInfo: {
                        methodName: PRIVATE_METHODS.CREATE_EXECUTION_REQUEST,
                        methodArgs: [
                            requestId,
                            initialRequestData,
                            toHex(promisedQuoteAmount),
                            orderId,
                            orderState,
                        ],
                    },
                    contractInfo: {
                        providedCweb: availableCweb - transactionFee,
                        authenticated: authInfo,
                    },
                    contractArgs: [constructRead(issuer, createOrderCollateralKey(orderId))],
                },
            },
        ]),
    ];
};
