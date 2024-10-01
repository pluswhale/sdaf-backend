import { Context, MethodCallback } from '@coinweb/contract-kit';
import { Logs } from '../types';
export declare const log: (logType: Logs, data: unknown) => void;
export declare const withContractCallLogger: (method: MethodCallback) => (context: Context) => import("@coinweb/contract-kit").NewTx[];
