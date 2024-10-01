import { constructContractIssuer, prepareQueueContractCall } from '@coinweb/contract-kit';
import { FEE, PUBLIC_METHODS, } from './shared/index.js';
import { toHex } from './shared/utils.js';
const createCallContractCommand = (contractId, methodName, methodArgs, cost, auth = true) => {
    const issuer = constructContractIssuer(contractId);
    const contractCall = prepareQueueContractCall(issuer, { methodName, methodArgs }, cost, auth);
    return JSON.stringify({ CustomV1: { calls: [contractCall] } });
};
export const makeDepositUiCommand = ({ contractId, depositAmount }) => {
    return createCallContractCommand(contractId, PUBLIC_METHODS.DEPOSIT, [toHex(depositAmount)], depositAmount + FEE.DEPOSIT);
};
export const makeWithdrawUiCommand = ({ contractId, withdrawAmount }) => {
    return createCallContractCommand(contractId, PUBLIC_METHODS.WITHDRAW, [toHex(withdrawAmount)], FEE.WITHDRAW);
};
export const createOrderUiCommand = ({ contractId, baseRecipient, l1Amount, baseAmount }) => {
    return createCallContractCommand(contractId, PUBLIC_METHODS.CREATE_ORDER, [toHex(baseAmount), toHex(l1Amount), baseRecipient], FEE.CREATE_ORDER);
};
export const deleteOrderUiCommand = ({ contractId, orderId }) => {
    return createCallContractCommand(contractId, PUBLIC_METHODS.CANCEL_ORDER, [orderId], FEE.CANCEL_ORDER);
};
