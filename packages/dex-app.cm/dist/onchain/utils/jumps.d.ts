export declare const wrapWithJumpEventClaimKey: (claimKey: ClaimKey, issuer: ClaimIssuer) => any;
export declare const wrapWithJumpEventIssuer: () => any;
export declare const wrapWithJumpEventBlockFilter: (filter: BlockFilter, issuer: ContractIssuer) => BlockFilter;
export declare const constructJumpCall: (claimKey: ClaimKey, providedCweb: bigint) => {
    callInfo: {
        ref: any;
        methodInfo: {
            methodName: string;
            methodArgs: any[];
        };
        contractInfo: {
            providedCweb: bigint;
            authenticated: null;
        };
        contractArgs: never[];
    };
}[];
export declare const unwrapEventClaim: <T extends Claim>(claim?: any) => T;
