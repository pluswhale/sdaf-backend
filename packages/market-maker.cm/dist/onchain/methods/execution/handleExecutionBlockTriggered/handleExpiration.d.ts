import { AuthInfo, Context } from '@coinweb/contract-kit';
import { HexBigInt, OrderStateClaimBody, RequestStateClaimBody } from '../../../../offchain/shared';
export declare const handleExpiration: ({ context, providedCweb, authInfo, requestId, orderId, requestFunds, order, request, }: {
    context: Context;
    providedCweb: bigint;
    authInfo: AuthInfo;
    requestId: string;
    orderId: string;
    requestFunds: HexBigInt;
    order: OrderStateClaimBody;
    request: RequestStateClaimBody;
}) => import("@coinweb/contract-kit").NewTxContinue[];
