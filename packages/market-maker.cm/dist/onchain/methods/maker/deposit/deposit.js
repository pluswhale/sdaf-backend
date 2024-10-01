import { constructContinueTx, constructStore, constructTake, passCwebFrom } from '@coinweb/contract-kit';
import { createMakerDepositKey } from '../../../../offchain/shared/index.js';
import { constructConditional, createMakerDepositClaim, getCallParameters, getContractIssuer, getMethodArguments, getReadClaimByIndex, getUser, } from '../../../utils/index.js';
export const deposit = (context) => {
    const { availableCweb } = getCallParameters(context);
    const [depositAmount] = getMethodArguments(context);
    const existedDepositClaim = getReadClaimByIndex(context)(0);
    const totalDeposit = BigInt(depositAmount) + BigInt(existedDepositClaim?.fees_stored || 0);
    const issuer = getContractIssuer(context);
    const user = existedDepositClaim?.body.owner ?? getUser(context);
    return [
        constructContinueTx(context, [
            passCwebFrom(issuer, availableCweb),
            ...constructConditional(!!existedDepositClaim, constructTake(createMakerDepositKey(user))),
            constructStore(createMakerDepositClaim({ user, amount: totalDeposit })),
        ]),
    ];
};
