import { constructClaim } from '@coinweb/contract-kit';
import { createMakerDepositKey, toHex } from '../../../offchain/shared/index.js';
import { getTime } from '../context.js';
export const createMakerDepositClaim = ({ amount, user }) => constructClaim(createMakerDepositKey(user), {
    owner: user,
    updatedAt: getTime(),
}, toHex(amount));
