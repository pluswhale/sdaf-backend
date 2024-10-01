import { User } from '@coinweb/contract-kit';
import { PositionStateClaimBody, HexBigInt } from '../../offchain/shared';
export declare const createPositionStateClaim: ({ id, body }: {
    id: string;
    body: PositionStateClaimBody;
}) => Claim;
export declare const createFundsClaim: ({ positionId, amount, owner, baseAmount, quoteAmount, }: {
    positionId: string;
    amount: bigint;
    owner: User;
    baseAmount: HexBigInt;
    quoteAmount: HexBigInt;
}) => Claim;
export declare const createActiveIndexClaim: ({ timestamp, positionId }: {
    timestamp: number;
    positionId: string;
}) => Claim;
export declare const createDateIndexClaim: ({ timestamp, positionId }: {
    timestamp: number;
    positionId: string;
}) => Claim;
export declare const createBestByQuoteIndexClaim: ({ baseAmount, quoteAmount, positionId, }: {
    baseAmount: bigint | HexBigInt;
    quoteAmount: bigint | HexBigInt;
    positionId: string;
}) => Claim;
export declare const createBestByQuoteActiveIndexClaim: ({ baseAmount, quoteAmount, positionId, }: {
    baseAmount: bigint | HexBigInt;
    quoteAmount: bigint | HexBigInt;
    positionId: string;
}) => Claim;
export declare const createUserIndexClaim: ({ user, timestamp, positionId, }: {
    user: User;
    timestamp: number;
    positionId: string;
}) => Claim;
export declare const createClosedIndexClaim: ({ positionId }: {
    positionId: string;
}) => Claim;
export declare const createOwnerClaim: ({ owner }: {
    owner: User;
}) => Claim;
export declare const createEvmEventClaimKey: (positionId: string, nonce: bigint) => ClaimKey;
export declare const createExpirationPositionClaimKey: (expirationDate: number) => ClaimKey;
