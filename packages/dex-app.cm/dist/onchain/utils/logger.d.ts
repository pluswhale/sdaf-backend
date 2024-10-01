import { Logs } from '../types';
export declare function log(logType: Logs.MethodName, data: string): void;
export declare function log(logType: Logs.ProvidedCweb, data: string): void;
export declare function log(logType: Logs.MethodArgument, data: unknown[]): void;
export declare function log(logType: Logs.ContractArguments, data: unknown[]): void;
export declare function log(logType: Logs.Custom, ...args: unknown[]): void;
export declare function log(...args: unknown[]): void;
export declare const withContractCallLogger: (method: MethodCallback) => (context: Context) => any;
