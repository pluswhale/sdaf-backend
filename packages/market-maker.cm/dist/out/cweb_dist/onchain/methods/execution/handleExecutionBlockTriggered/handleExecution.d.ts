import { Context, ContractIssuer, User } from '@coinweb/contract-kit';
import { HexBigInt, OrderStateClaimBody, RequestStateClaimBody } from '../../../../offchain/shared';
export declare const handleExecution: ({ requestId, orderId, context, issuer, providedCweb, orderState, requestState, depositAmount, depositOwner, }: {
    requestId: string;
    orderId: string;
    context: Context;
    issuer: ContractIssuer;
    providedCweb: bigint;
    orderState: OrderStateClaimBody;
    requestState: RequestStateClaimBody;
    depositAmount: HexBigInt;
    depositOwner: User;
}) => import("@coinweb/contract-kit").NewTxContinue[];
