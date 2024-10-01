import { Client } from './types';
export declare const getActivePositionIds: (client: Client) => Promise<string[]>;
export declare const getBestPositionIds: (client: Client) => Promise<string[]>;
export declare const getBestActivePositionIds: (client: Client) => Promise<string[]>;
export declare const getLastPositionIds: (client: Client) => Promise<string[]>;
export declare const getUserPositionIds: (client: Client, user: User) => Promise<string[]>;
export declare const getPositionById: (client: Client, id: string) => Promise<{
    id: string;
    baseAmount: bigint;
    quoteAmount: bigint;
    recipient: string;
    createdAt: number;
    activityStatus: import("./shared/constants").ACTIVITY_STATUS;
    paymentStatus: import("./shared/constants").PAYMENT_STATUS;
    funds: bigint;
    chainData: unknown;
    txId: string;
}>;
