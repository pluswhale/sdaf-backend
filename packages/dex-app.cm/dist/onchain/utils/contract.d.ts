import { InstanceParametersForBtc, InstanceParametersForEvm, L1Types } from '../types';
export declare const getExpectedBlockHeight: (futureDate: number) => any;
export declare function getInstanceParameters(l1Type: L1Types.Evm): InstanceParametersForEvm;
export declare function getInstanceParameters(l1Type: L1Types.Btc): InstanceParametersForBtc;
export declare function getInstanceParameters(): InstanceParametersForEvm | InstanceParametersForBtc;
export declare const getTime: () => number;
