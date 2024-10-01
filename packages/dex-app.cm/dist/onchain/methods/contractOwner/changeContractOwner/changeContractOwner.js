import { constructContinueTx, constructStore, extractContractArgs, extractRead, getMethodArguments, } from '@coinweb/contract-kit';
import { createOwnerClaim, getInstanceParameters, getUser, isEqualUser } from '../../../utils';
export const changeContractOwner = (context) => {
    const { tx } = context;
    const [, newOwner] = getMethodArguments(context);
    const ownerClaim = extractRead(extractContractArgs(tx)[0])?.[0]?.content.body;
    const currentOwner = ownerClaim?.owner || getInstanceParameters().owner;
    const signer = getUser(context);
    if (!isEqualUser(currentOwner, signer)) {
        throw new Error('Operation not permitted');
    }
    if (isEqualUser(currentOwner, newOwner)) {
        throw new Error('The new contract owner may not be the same');
    }
    return [
        constructContinueTx(context, [
            constructStore(createOwnerClaim({
                owner: newOwner,
            })),
        ]),
    ];
};
