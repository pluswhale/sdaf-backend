import { Context, Claim } from '@coinweb/contract-kit';
import { InstanceParameters, TypedClaim } from '../types';
export declare const getMethodArguments: <TArguments extends unknown[]>(context: Context) => TArguments;
export declare const getContractArguments: <TArguments extends unknown[]>(context: Context) => TArguments;
export declare const getInstanceParameters: () => InstanceParameters;
export declare const getCallParameters: (context: Context) => {
    availableCweb: bigint;
    authInfo: import("@coinweb/contract-kit").AuthInfo;
};
export declare const getContractIssuer: (context: Context) => import("@coinweb/contract-kit").ContractIssuer;
export declare const getContractRef: (context: Context) => import("@coinweb/contract-kit").ContractRefV0;
export declare const getUser: (context: Context) => import("@coinweb/contract-kit").User;
export declare const getReadClaimByIndex: <TClaim extends Claim = TypedClaim<unknown>>(context: Context) => (index: number) => TClaim | null;
export declare const getTime: () => number;
