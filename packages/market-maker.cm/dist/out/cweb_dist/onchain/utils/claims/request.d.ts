import { Claim, User } from '@coinweb/contract-kit';
import { RequestStateClaimBody } from '../../../offchain/shared';
export declare const createRequestStateClaim: ({ id, body }: {
    id: string;
    body: RequestStateClaimBody;
}) => Claim;
export declare const createRequestFundsClaim: ({ id, amount }: {
    id: string;
    amount: bigint;
}) => Claim;
export declare const createRequestByOrderIndexClaim: ({ id, orderId, timestamp, }: {
    orderId: string;
    timestamp: number;
    id: string;
}) => Claim;
export declare const createRequestByMarketMakerIndexClaim: ({ marketMaker, timestamp, id, }: {
    marketMaker: User;
    timestamp: number;
    id: string;
}) => Claim;
