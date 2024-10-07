import { constructContractIssuer, prepareQueueContractCall } from '@coinweb/contract-kit';
import { FEE, PUBLIC_METHODS } from './shared';
const createCallContractCommand = (contractId, methodName, methodArgs, cost, auth = true) => {
    const issuer = constructContractIssuer(contractId);
    const contractCall = prepareQueueContractCall(issuer, { methodName, methodArgs }, cost, auth);
    return JSON.stringify({ CustomV1: { calls: [contractCall] } });
};
export const creteNewPositionUiCommand = ({ contractId, quoteAmount, recipient, contractOwnerFee, baseAmount, chainData, }) => {
    return createCallContractCommand(contractId, PUBLIC_METHODS.CREATE_POSITION, [quoteAmount, recipient, chainData], BigInt(baseAmount) + BigInt(contractOwnerFee) + FEE.CREATE_POSITION);
};
export const creteNewPositionBtcUiCommand = (data) => {
    return creteNewPositionUiCommand(data);
};
export const creteNewPositionEvmUiCommand = (data) => {
    return creteNewPositionUiCommand(data);
};
export const cancelPositionUiCommand = ({ contractId, positionId }) => {
    return createCallContractCommand(contractId, PUBLIC_METHODS.CANCEL_POSITION, [positionId], FEE.CANCEL_POSITION);
};
