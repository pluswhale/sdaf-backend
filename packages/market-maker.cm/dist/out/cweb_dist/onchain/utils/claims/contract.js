import { constructClaim } from '@coinweb/contract-kit';
import { createContractOwnerKey, toHex } from '../../../offchain/shared/index.js';
import { getTime } from '../context.js';
export const createContractOwnerClaim = ({ owner }) => constructClaim(createContractOwnerKey(), {
    owner,
    updatedAt: getTime(),
}, toHex(0));
