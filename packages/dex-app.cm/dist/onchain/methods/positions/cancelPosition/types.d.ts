import { PositionStateClaimBody } from '../../../../offchain';
export declare type ClosePositionMethodArgs = [
    positionId: string,
    positionData: Omit<PositionStateClaimBody, 'activityStatus' | 'paymentStatus' | 'funds'>
];
