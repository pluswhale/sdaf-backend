import { constructContinueTx, constructStore, constructTake, passCwebFrom, } from '@coinweb/contract-kit';
import { ACTIVITY_STATUS, PAYMENT_STATUS, createActivePositionIndexKey, createBestByQuoteActiveIndexKey, createPositionFundsKey, toHex, } from '../../../../offchain/shared';
import { constructSendCweb, createClosedIndexClaim, createPositionStateClaim, createBestByQuoteIndex, } from '../../../utils';
export const handleExpiration = (context, issuer, positionId, positionState, positionFundsClaim, availableCweb) => {
    const positionStoredAmount = positionFundsClaim.fees_stored;
    const positionFunds = positionFundsClaim.body;
    const fundsOwner = positionFunds.owner;
    if (!fundsOwner) {
        throw new Error('Cannot return funds');
    }
    return [
        constructContinueTx(context, [
            passCwebFrom(issuer, availableCweb),
            constructTake(createPositionFundsKey(positionId)),
            ...constructSendCweb(BigInt(positionStoredAmount), fundsOwner, null),
            constructStore(createPositionStateClaim({
                id: positionId,
                body: {
                    ...positionState,
                    activityStatus: ACTIVITY_STATUS.EXPIRED,
                    paymentStatus: PAYMENT_STATUS.NOT_PAYABLE,
                    funds: toHex(0),
                },
            })),
            constructTake(createActivePositionIndexKey(positionState.createdAt, positionId)),
            constructTake(createBestByQuoteActiveIndexKey(createBestByQuoteIndex(positionState.baseAmount, positionState.quoteAmount), positionId)),
            constructStore(createClosedIndexClaim({ positionId })),
        ]),
    ];
};
