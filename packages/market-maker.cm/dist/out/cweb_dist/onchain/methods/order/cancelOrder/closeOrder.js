import { constructContinueTx, constructStore, constructTake, passCwebFrom } from '@coinweb/contract-kit';
import { createOrderCollateralKey, createMakerDepositKey, toHex, createActiveOrderIndexKey, createBestActiveOrderIndexKey, } from '../../../../offchain/shared/index.js';
import { createClosedOrderIndexClaim, createOrderStateClaim, createMakerDepositClaim, getCallParameters, getContractIssuer, getMethodArguments, getReadClaimByIndex, createRateIndex, getUser, } from '../../../utils/index.js';
import { isEqualUser } from '../../../utils/user.js';
export const closeOrder = (context) => {
    const { availableCweb } = getCallParameters(context);
    const signer = getUser(context);
    const [id, statusReason] = getMethodArguments(context);
    const stateClaim = getReadClaimByIndex(context)(0);
    const orderState = stateClaim?.body;
    if (!orderState) {
        throw new Error('Order is not exist');
    }
    if (!isEqualUser(orderState.owner, signer)) {
        throw new Error('Operation is not permitted');
    }
    const collateralClaim = getReadClaimByIndex(context)(1);
    if (!collateralClaim) {
        throw new Error('Order is not active');
    }
    const depositClaim = getReadClaimByIndex(context)(2);
    if (!depositClaim) {
        throw new Error('Market maker is not exist');
    }
    const deposit = depositClaim.body;
    const storedDeposit = depositClaim.fees_stored;
    const storedCollateral = collateralClaim.fees_stored;
    const issuer = getContractIssuer(context);
    return [
        constructContinueTx(context, [
            passCwebFrom(issuer, availableCweb),
            constructTake(createActiveOrderIndexKey(orderState.createdAt, id)),
            constructTake(createBestActiveOrderIndexKey(createRateIndex(orderState.baseAmount, orderState.l1Amount), id)),
            constructTake(createOrderCollateralKey(id)),
            constructTake(createMakerDepositKey(deposit.owner)),
            constructStore(createOrderStateClaim({
                id,
                body: {
                    ...stateClaim.body,
                    activityStatus: statusReason,
                    collateral: toHex(0),
                    covering: toHex(0),
                },
            })),
            constructStore(createMakerDepositClaim({
                amount: BigInt(storedDeposit) + BigInt(storedCollateral),
                user: deposit.owner,
            })),
            constructStore(createClosedOrderIndexClaim({ id })),
        ]),
    ];
};
