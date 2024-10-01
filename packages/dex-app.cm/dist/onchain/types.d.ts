import { Claim, HexString, OrdJson, Shard, User } from '@coinweb/contract-kit';
import { HexBigInt, L1TxDataForAccept, L1TxDataForTransfer } from '../offchain/shared';
export declare type EvmEventClaimBody = {
    data: string;
};
export declare type BtcEventClaimBody = {
    UtxoBased: {
        vout: {
            scriptPubKey: {
                asm: string;
            };
        }[];
    };
};
export declare type CallContractData = {
    l2Contract: string;
    l2MethodName: string;
    l2Args: unknown[];
};
export declare type L1EventData = {
    recipient: HexBigInt;
    paidAmount: HexBigInt;
} & (L1TxDataForAccept | L1TxDataForTransfer);
export declare enum L1Types {
    Evm = 0,
    Btc = 1
}
export declare enum Logs {
    MethodName = "method-name",
    ProvidedCweb = "provided-cweb",
    MethodArgument = "method-args",
    ContractArguments = "contract-args",
    Custom = "custom"
}
export declare type InstanceParameters = {
    l1_type: L1Types;
    l1_contract_address?: string;
    shard: Shard;
    owner: User;
    logs?: Logs[];
    owner_min_fee?: HexString;
    owner_percentage_fee?: number;
};
export declare type InstanceParametersForEvm = {
    l1_type: L1Types.Evm;
    l1_contract_address: string;
} & Omit<InstanceParameters, 'l1_type' | 'l1_contract_address'>;
export declare type InstanceParametersForBtc = {
    l1_type: L1Types.Btc;
} & Omit<InstanceParameters, 'l1_type' | 'l1_contract_address'>;
export declare type OwnerClaimBody = {
    owner: User;
    updatedAt: number;
};
export declare type TypedClaim<T extends OrdJson | null> = Claim & {
    body: T;
    fees_stored: HexBigInt;
};
