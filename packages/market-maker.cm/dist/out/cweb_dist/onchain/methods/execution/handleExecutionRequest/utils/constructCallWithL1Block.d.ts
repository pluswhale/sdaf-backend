import { AuthInfo, Context, ContractIssuer, User } from '@coinweb/contract-kit';
export declare const constructCallWithL1Block: ({ context, requestId, orderId, nonce, providedCweb, authInfo, issuer, expirationDate, owner, }: {
    context: Context;
    requestId: string;
    orderId: string;
    nonce: bigint;
    providedCweb: bigint;
    authInfo: AuthInfo;
    issuer: ContractIssuer;
    expirationDate: number;
    owner: User;
}) => import("@coinweb/contract-kit").NewTxContinue;
