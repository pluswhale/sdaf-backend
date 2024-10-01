import { Key } from './constants';
export declare const createPositionStateFirstPart: () => Key[];
export declare const createPositionFundsFirstPart: () => Key[];
export declare const createDateIndexFirstPart: () => Key[];
export declare const createBestByQuoteIndexFirstPart: () => Key[];
export declare const createActivePositionIndexFirstPart: () => Key[];
export declare const createBestByQuoteActiveIndexFirstPart: () => Key[];
export declare const createUserIndexFirstPart: (user: User) => any[];
export declare const createClosedIndexFirstPart: () => Key[];
export declare const createOwnerFirstPart: () => Key[];
export declare const createPositionStateKey: (positionId: string) => {
    first_part: Key[];
    second_part: string[];
}, satisfies: any, ClaimKey: any;
export declare const createPositionFundsKey: (positionId: string) => {
    first_part: Key[];
    second_part: string[];
}, satisfies: any, ClaimKey: any;
export declare const createDateIndexKey: (timestamp: number, positionId: string) => {
    first_part: Key[];
    second_part: (string | number)[];
}, satisfies: any, ClaimKey: any;
export declare const createBestByQuoteIndexKey: (rate: bigint, positionId: string) => {
    first_part: Key[];
    second_part: string[];
}, satisfies: any, ClaimKey: any;
export declare const createActivePositionIndexKey: (timestamp: number, positionId: string) => {
    first_part: Key[];
    second_part: (string | number)[];
}, satisfies: any, ClaimKey: any;
export declare const createBestByQuoteActiveIndexKey: (rate: bigint, positionId: string) => {
    first_part: Key[];
    second_part: string[];
}, satisfies: any, ClaimKey: any;
export declare const createUserIndexKey: (user: User, timestamp: number, positionId: string) => {
    first_part: any[];
    second_part: (string | number)[];
}, satisfies: any, ClaimKey: any;
export declare const createClosedIndexKey: (positionId: string) => {
    first_part: Key[];
    second_part: string[];
}, satisfies: any, ClaimKey: any;
export declare const createOwnerKey: () => {
    first_part: Key[];
    second_part: never[];
}, satisfies: any, ClaimKey: any;
