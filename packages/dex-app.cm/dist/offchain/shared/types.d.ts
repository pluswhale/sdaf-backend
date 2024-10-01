import type { HexString, User } from '@coinweb/contract-kit';
import { ACTIVITY_STATUS, PAYMENT_STATUS, CallType } from './constants';
export declare type PubKey = string;
export declare type HexBigInt = `0x${string}`;
export declare type PositionStateClaimBody = {
    recipient: string;
    baseAmount: HexBigInt;
    quoteAmount: HexBigInt;
    createdAt: number;
    expirationDate: number;
    activityStatus: ACTIVITY_STATUS;
    paymentStatus: PAYMENT_STATUS;
    funds: HexBigInt;
    chainData: ChainData;
    txId: string;
};
export declare type PositionFundsClaimBody = {
    owner: User;
    baseAmount: HexBigInt;
    quoteAmount: HexBigInt;
};
export declare type ChainData = unknown;
export declare type BtcChainData = {
    l1TxId: string;
    vout: number;
    psbt: string;
};
export declare type L1TxDataForAccept = {
    callType: CallType.Accept;
    quoteAmount: HexString;
    quoteRecipient: HexString;
    baseRecipient: HexString;
};
export declare type L1TxDataForTransfer = {
    callType: CallType.Transfer;
    quoteAmount: HexString;
    quoteRecipient: HexString;
    nextContractId: HexString;
    nextContractMethod: HexString;
    fallbackContractId: HexString;
    fallbackContractMethod: HexString;
};
