import { AuthInfo, Context, ContractIssuer } from '@coinweb/contract-kit';
import { OrderStateClaimBody } from '../../../../../offchain/shared';
export declare const constructPrivateOrderCall: (context: Context, issuer: ContractIssuer, orderId: string, orderInitialState: OrderStateClaimBody, providedCweb: bigint, authenticated: AuthInfo) => never[];
