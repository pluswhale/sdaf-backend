import { Key } from '../constants.js';
export const createContractOwnerFirstPart = () => [Key.CONTRACT_OWNER];
export const createContractOwnerKey = () => ({
    first_part: createContractOwnerFirstPart(),
    second_part: [],
});
