import type { GqlIssuedClaim } from '@coinweb/wallet-lib';
import { BtcChainData, ChainData } from './shared';
import { ACTIVITY_STATUS, PAYMENT_STATUS } from './shared/constants';
export declare type CreatePositionRequestData = {
    contractId: string;
    baseAmount: string;
    quoteAmount: string;
    recipient: string;
    contractOwnerFee: string;
    chainData?: ChainData;
};
export declare type CreatePositionBtcRequestData = Omit<CreatePositionRequestData, 'chainData'> & {
    chainData: BtcChainData;
};
export declare type CreatePositionEvmRequestData = Omit<CreatePositionRequestData, 'chainData'>;
export declare type CancelPositionRequestData = {
    contractId: string;
    positionId: string;
};
export declare type IssuedClaim = GqlIssuedClaim & {
    content: {
        key: {
            first_part: string;
            second_part: string;
        };
    };
};
export declare type Pagination = {
    limit: number;
    offset: number;
};
export declare type PositionData = {
    id: string;
    recipient: string;
    baseAmount: bigint;
    quoteAmount: bigint;
    activityStatus: ACTIVITY_STATUS;
    paymentStatus: PAYMENT_STATUS;
    funds: bigint;
    createdAt: number;
    chainData?: ChainData;
    txId: string;
};
export declare type Client = {
    fetchClaims<T extends NonNullable<unknown>>(firstPart: NonNullable<unknown>, secondPart: T | null, range?: {
        start: T;
        end: T;
    }): Promise<GqlIssuedClaim[]>;
};
