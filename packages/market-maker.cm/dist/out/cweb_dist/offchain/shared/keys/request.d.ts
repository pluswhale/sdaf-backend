import { User } from '@coinweb/contract-kit';
import { Key } from '../constants';
export declare const createRequestStateFirstPart: () => Key[];
export declare const createRequestFundsFirstPart: () => Key[];
export declare const createRequestByOrderIndexFirstPart: (orderId: string) => string[];
export declare const createRequestByMarketMakerIndexFirstPart: (marketMaker: User) => (User | Key)[];
export declare const createRequestStateKey: (id: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createRequestFundsKey: (id: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createRequestByOrderIndexKey: (orderId: string, timestamp: number, requestId: string) => {
    first_part: string[];
    second_part: (string | number)[];
};
export declare const createRequestByMarketMakerIndexKey: (marketMaker: User, timestamp: number, requestId: string) => {
    first_part: (User | Key)[];
    second_part: (string | number)[];
};
