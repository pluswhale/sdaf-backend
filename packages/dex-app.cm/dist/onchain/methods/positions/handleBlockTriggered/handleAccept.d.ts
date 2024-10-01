import { HexBigInt, PositionFundsClaimBody } from '../../../../offchain/shared';
import { TypedClaim } from '../../../types';
export declare const handleAccept: (context: Context, issuer: ContractIssuer, positionId: string, nonce: HexBigInt | null, positionState: PositionStateClaimBody, positionStoredAmount: HexBigInt, fundsClaim: TypedClaim<PositionFundsClaimBody>, availableCweb: bigint, authenticated: AuthInfo, paidAmount: HexBigInt, cwebAccount: User, recipient: HexBigInt) => any[];
