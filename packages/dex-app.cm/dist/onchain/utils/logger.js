/* eslint-disable no-console */
import { extractBlock, extractContractArgs, extractContractInfo, extractRead, extractTake, getMethodArguments, isResolvedBlock, isResolvedData, isResolvedRead, isResolvedStore, isResolvedTake, } from '@coinweb/contract-kit';
import { toHex } from '../../offchain/shared';
import { Logs } from '../types';
import { getInstanceParameters } from './contract';
const normalizeData = (data) => {
    if (typeof data === 'object') {
        return JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? toHex(v) : v));
    }
    if (data === undefined) {
        return 'undefined';
    }
    return data;
};
export function log(...args) {
    if (!Object.values(Logs).includes(args[0])) {
        console.log(args.map(normalizeData));
    }
    const [logType, ...data] = args;
    const allowedLogs = getInstanceParameters().logs;
    if (allowedLogs?.includes(logType)) {
        switch (logType) {
            case Logs.MethodName:
                console.log(`Method name: ${data[0]};`);
                break;
            case Logs.ProvidedCweb:
                console.log(`Provided Cweb: ${data[0]};`);
                break;
            case Logs.MethodArgument:
                console.log(`Method args: ${normalizeData(data[0])};`);
                break;
            case Logs.ContractArguments:
                console.log(`Contract args: ${normalizeData(data[0])};`);
                break;
            case Logs.Custom:
            default:
                console.log(data.map(normalizeData));
                break;
        }
    }
}
const extractOp = (op) => {
    if (isResolvedRead(op)) {
        return `[ReadOp:] ${extractRead(op)
            ?.map((val) => normalizeData(val.content))
            .join(', ')}`;
    }
    if (isResolvedBlock(op)) {
        return `[BlockOp:] ${extractBlock(op)
            ?.map((val) => normalizeData(val))
            .join(', ')}`;
    }
    if (isResolvedTake(op)) {
        return `[TakeOp:] ${extractTake(op)}`;
    }
    if (isResolvedStore(op)) {
        return '[StoreOp]';
    }
    if (isResolvedData(op)) {
        return '[DataOp]';
    }
    return '[ResolvedOp]';
};
export const withContractCallLogger = (method) => {
    return (context) => {
        const [methodName, ...methodArgs] = getMethodArguments(context);
        const contractArgs = extractContractArgs(context.tx);
        const { providedCweb } = extractContractInfo(context.tx);
        log(Logs.MethodName, methodName);
        log(Logs.ProvidedCweb, providedCweb);
        log(Logs.MethodArgument, methodArgs.map(normalizeData).join(', '));
        log(Logs.ContractArguments, contractArgs.map(extractOp).join(', '));
        return method(context);
    };
};
