export declare const createExpirationPositionBlockFilter: (expirationDate: number) => BlockFilter;
export declare const createClosedPositionBlockFilter: (issuer: ContractIssuer, positionId: string) => BlockFilter;
export declare const createL1AcceptEventBlockFilter: (claimKey: ClaimKey) => BlockFilter;
