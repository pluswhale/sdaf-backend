import { HexBigInt } from '../../offchain/shared';
import { L1EventData } from '../types';
export declare const hashObject: (args: Record<string, unknown>, nonce?: string) => string;
export declare const parseL1EventData: (data: string) => L1EventData;
export declare const createRateIndex: (base: HexBigInt | bigint, quote: HexBigInt | bigint) => bigint;
