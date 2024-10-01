import { FEE, ORDER_ACTIVITY_STATUS, toHex, } from '../../../../offchain/shared/index.js';
import { CONSTANTS } from '../../../constants.js';
import { getCallParameters, getContractIssuer, getInstanceParameters, getMethodArguments, getTime, getUser, hashObject, } from '../../../utils/index.js';
import { constructPrivateOrderCall } from './utils/index.js';
export const createOrderPublic = (context) => {
    const { authInfo, availableCweb } = getCallParameters(context);
    const [baseAmount, l1Amount, baseRecipient] = getMethodArguments(context);
    const collateralPercentage = getInstanceParameters().collateral_percentage_Int;
    const collateral = (BigInt(baseAmount) * BigInt(collateralPercentage)) / 100n;
    if (availableCweb < FEE.CREATE_ORDER) {
        throw new Error('Insufficient cweb provided'); //TODO! Return a rest of cweb;
    }
    const createdAt = getTime();
    const initialState = {
        activityStatus: ORDER_ACTIVITY_STATUS.ACTIVE,
        baseAmount,
        l1Amount,
        createdAt,
        expirationDate: createdAt + CONSTANTS.ORDER_LIFE_TIME,
        collateral: toHex(collateral),
        covering: baseAmount,
        baseRecipient,
        owner: getUser(context),
        txId: context.call.txid,
    };
    const orderId = hashObject(initialState);
    const issuer = getContractIssuer(context);
    return constructPrivateOrderCall(context, issuer, orderId, initialState, availableCweb, authInfo);
};
