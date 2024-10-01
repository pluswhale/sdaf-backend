import { CallType, L1TxDataForAccept, L1TxDataForTransfer } from './shared';
export declare const createL1TxData: (params: L1TxDataForAccept | L1TxDataForTransfer) => Uint8Array;
declare type ParseL1TxData<TCallType extends CallType> = TCallType extends CallType.Accept ? L1TxDataForAccept : TCallType extends CallType.Transfer ? L1TxDataForTransfer : L1TxDataForAccept | L1TxDataForTransfer;
export declare const parseL1TxData: <TCallType extends CallType>(hexData: HexString) => ParseL1TxData<TCallType>;
export declare const uint8ArrayToHexStr: (uint8: Uint8Array) => string;
export {};
