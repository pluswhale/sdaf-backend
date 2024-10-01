import { type Claim, User } from '@coinweb/contract-kit';
import { OrderStateClaimBody, HexBigInt } from '../../../offchain/shared';
export declare const createOrderStateClaim: ({ id, body }: {
    id: string;
    body: OrderStateClaimBody;
}) => Claim;
export declare const createOrderCollateralClaim: ({ id, amount, owner }: {
    id: string;
    amount: bigint;
    owner: User;
}) => Claim;
export declare const createOrderActiveIndexClaim: ({ timestamp, id }: {
    timestamp: number;
    id: string;
}) => Claim;
export declare const createOrderDateIndexClaim: ({ timestamp, id }: {
    timestamp: number;
    id: string;
}) => Claim;
export declare const createBestOrderIndexClaim: ({ baseAmount, quoteAmount, id, }: {
    baseAmount: bigint | HexBigInt;
    quoteAmount: bigint | HexBigInt;
    id: string;
}) => Claim;
export declare const createBestActiveOrderIndexClaim: ({ baseAmount, quoteAmount, id, }: {
    baseAmount: bigint | HexBigInt;
    quoteAmount: bigint | HexBigInt;
    id: string;
}) => Claim;
export declare const createOrderByOwnerIndexClaim: ({ user, timestamp, id, }: {
    user: User;
    timestamp: number;
    id: string;
}) => Claim;
export declare const createPendingOrderByOwnerIndexClaim: ({ user, timestamp, id, }: {
    user: User;
    timestamp: number;
    id: string;
}) => Claim;
export declare const createClosedOrderIndexClaim: ({ id }: {
    id: string;
}) => Claim;
