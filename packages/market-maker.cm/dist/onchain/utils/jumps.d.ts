import { BlockFilter, Claim, ClaimIssuer, ClaimKey, ContractIssuer } from '@coinweb/contract-kit';
export declare const wrapWithJumpEventBlockFilter: (filter: BlockFilter, issuer: ContractIssuer) => BlockFilter;
export declare const constructJumpCall: (eventNonce: bigint, requestId: string, providedCweb: bigint) => {
    callInfo: {
        ref: import("@coinweb/contract-kit").ContractRefV0;
        methodInfo: {
            methodName: string;
            methodArgs: (BlockFilter | import("@coinweb/contract-kit").Shard)[];
        };
        contractInfo: {
            providedCweb: bigint;
            authenticated: null;
        };
        contractArgs: never[];
    };
}[];
export declare const wrapWithJumpEventClaimKey: (claimKey: ClaimKey, issuer: ClaimIssuer) => ClaimKey;
export declare const unwrapEventClaim: <T extends Claim | null>(claim?: Claim | null) => T;
export declare const wrapWithJumpEventIssuer: () => ClaimIssuer;
