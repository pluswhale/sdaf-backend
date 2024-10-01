import { PositionFundsClaimBody } from '../../../../offchain/shared';
import { TypedClaim } from '../../../types';
export declare const handleExpiration: (context: Context, issuer: ContractIssuer, positionId: string, positionState: PositionStateClaimBody, positionFundsClaim: TypedClaim<PositionFundsClaimBody>, availableCweb: bigint) => any[];
