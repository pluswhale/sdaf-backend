import { User } from '@coinweb/contract-kit';
import { Key } from '../constants';
export declare const createMakerStateFirstPart: () => Key[];
export declare const createMakerDepositFirstPart: () => Key[];
export declare const createMakerStateKey: (id: string) => {
    first_part: Key[];
    second_part: string[];
};
export declare const createMakerDepositKey: (user: User) => {
    first_part: Key[];
    second_part: User[];
};
