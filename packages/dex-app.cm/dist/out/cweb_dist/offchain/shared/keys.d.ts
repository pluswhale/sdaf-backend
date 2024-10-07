import type { OrdJson, User } from '@coinweb/contract-kit';
import { Key } from './constants';
import { BtcChainData } from './types';
export declare const createPositionStateFirstPart: () => Key[];
export declare const createPositionFundsFirstPart: () => Key[];
export declare const createDateIndexFirstPart: () => Key[];
export declare const createBestByQuoteIndexFirstPart: () => Key[];
export declare const createActivePositionIndexFirstPart: () => Key[];
export declare const createBestByQuoteActiveIndexFirstPart: () => Key[];
export declare const createUserIndexFirstPart: (user: User) => (User | Key)[];
export declare const createClosedIndexFirstPart: () => Key[];
export declare const createOwnerFirstPart: () => Key[];
export declare const createUniquenessFirstPart: () => Key[];
export declare const createErrorByDateFirstPart: () => Key[];
export declare const createPositionStateKey: (positionId: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createPositionFundsKey: (positionId: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createDateIndexKey: (timestamp: number, positionId: string) => {
    first_part: Key[];
    second_part: (string | number)[];
};
export declare const createBestByQuoteIndexKey: (rate: bigint, positionId: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createActivePositionIndexKey: (timestamp: number, positionId: string) => {
    first_part: Key[];
    second_part: (string | number)[];
};
export declare const createBestByQuoteActiveIndexKey: (rate: bigint, positionId: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createUserIndexKey: (user: User, timestamp: number, positionId: string) => {
    first_part: (User | Key)[];
    second_part: (string | number)[];
};
export declare const createClosedIndexKey: (positionId: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createOwnerKey: () => {
    first_part: Key[];
    second_part: never[];
};
export declare const createUniquenessKey: (data: OrdJson) => {
    first_part: Key[];
    second_part: unknown;
};
export declare const createBtcUtxoUniquenessKey: (data: BtcChainData) => {
    first_part: Key[];
    second_part: (string | number)[];
};
export declare const createErrorByDateKey: (timestamp: number, positionId: string) => {
    first_part: Key[];
    second_part: (string | number)[];
};
