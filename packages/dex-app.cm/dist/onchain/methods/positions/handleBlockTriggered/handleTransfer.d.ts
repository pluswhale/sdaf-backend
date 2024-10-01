import { HexBigInt, PositionFundsClaimBody } from '../../../../offchain/shared';
import { CallContractData, TypedClaim } from '../../../types';
export declare const handleTransfer: (context: Context, issuer: ContractIssuer, positionId: string, nonce: HexBigInt | null, positionState: PositionStateClaimBody, positionStoredAmount: HexBigInt, fundsClaim: TypedClaim<PositionFundsClaimBody>, availableCweb: bigint, authenticated: AuthInfo, paidAmount: HexBigInt, recipient: HexBigInt, callContractData: CallContractData) => any[];
