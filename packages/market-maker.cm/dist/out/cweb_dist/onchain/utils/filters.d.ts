import { BlockFilter, ClaimKey, ContractIssuer } from '@coinweb/contract-kit';
export declare const createExpirationClaimKey: (expirationDate: number) => ClaimKey;
export declare const createExpirationBlockFilter: (expirationDate: number) => BlockFilter;
export declare const createClosedOrderBlockFilter: (issuer: ContractIssuer, id: string) => BlockFilter;
export declare const createL1ExecuteEventClaimKey: (requestId: string, nonce: bigint) => ClaimKey;
export declare const createL1ExecuteEventBlockFilter: (id: string, nonce: bigint) => BlockFilter;
