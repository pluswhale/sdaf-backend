import { CancelPositionRequestData, CreatePositionBtcRequestData, CreatePositionEvmRequestData, CreatePositionRequestData } from './types';
export declare const creteNewPositionUiCommand: ({ contractId, quoteAmount, recipient, contractOwnerFee, baseAmount, chainData, }: CreatePositionRequestData) => string;
export declare const creteNewPositionBtcUiCommand: (data: CreatePositionBtcRequestData) => string;
export declare const creteNewPositionEvmUiCommand: (data: CreatePositionEvmRequestData) => string;
export declare const cancelPositionUiCommand: ({ contractId, positionId }: CancelPositionRequestData) => string;
