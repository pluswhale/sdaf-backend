import { constructContinueTx, constructStore, extractContractArgs, extractRead, getMethodArguments, getParameters, } from '@coinweb/contract-kit';
import { getUser } from '../../../utils/index.js';
import { createContractOwnerClaim } from '../../../utils/claims/index.js';
import { isEqualUser } from '../../../utils/user.js';
export const changeContractOwner = (context) => {
    const { tx } = context;
    const [, newOwner] = getMethodArguments(context);
    const ownerClaim = extractRead(extractContractArgs(tx)[0])?.[0]?.content.body;
    const currentOwner = ownerClaim?.owner || getParameters('contract/parameters.json').owner;
    const signer = getUser(context);
    if (!isEqualUser(currentOwner, signer)) {
        throw new Error('Operation not permitted');
    }
    if (isEqualUser(currentOwner, newOwner)) {
        throw new Error('The new contract owner may not be the same');
    }
    return [
        constructContinueTx(context, [
            constructStore(createContractOwnerClaim({
                owner: newOwner,
            })),
        ]),
    ];
};
