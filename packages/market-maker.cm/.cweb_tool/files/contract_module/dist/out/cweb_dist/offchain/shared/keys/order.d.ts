import { User } from '@coinweb/contract-kit';
import { Key } from '../constants';
export declare const createOrderStateFirstPart: () => Key[];
export declare const createOrderCollateralFirstPart: () => Key[];
export declare const createOrderDateIndexFirstPart: () => Key[];
export declare const createBestOrderIndexFirstPart: () => Key[];
export declare const createActiveOrderIndexFirstPart: () => Key[];
export declare const createBestActiveOrderIndexFirstPart: () => Key[];
export declare const createOrderByOwnerIndexFirstPart: (user: User) => (User | Key)[];
export declare const createBestOrderByOwnerIndexFirstPart: (user: User) => (User | Key)[];
export declare const createOrderClosedIndexFirstPart: () => Key[];
export declare const createPendingOrderByOwnerIndexFirstPart: (user: User) => (User | Key)[];
export declare const createOrderStateKey: (id: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createOrderCollateralKey: (id: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createOrderDateIndexKey: (timestamp: number, id: string) => {
    first_part: Key[];
    second_part: (string | number)[];
};
export declare const createBestOrderIndexKey: (rate: bigint, id: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createActiveOrderIndexKey: (timestamp: number, id: string) => {
    first_part: Key[];
    second_part: (string | number)[];
};
export declare const createBestActiveOrderIndexKey: (rate: bigint, id: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createOrderByOwnerIndexKey: (user: User, timestamp: number, id: string) => {
    first_part: (User | Key)[];
    second_part: (string | number)[];
};
export declare const createPendingOrderByOwnerIndexKey: (user: User, timestamp: number, id: string) => {
    first_part: (User | Key)[];
    second_part: (string | number)[];
};
export declare const createBestOrderByOwnerIndexKey: (rate: bigint, user: User, id: string) => {
    first_part: (User | Key)[];
    second_part: string[];
};
export declare const createClosedOrderIndexKey: (id: string) => {
    first_part: Key[];
    second_part: string[];
};
