import { AuthInfo, Context } from '@coinweb/contract-kit';
import { HexBigInt } from '../../../../../offchain/shared';
export declare const constructPrepareRequestCall: ({ context, availableCweb, authInfo, requestedQuoteAmount, quoteWallet, fallbackContractId, fallbackMethodName, nonce, }: {
    context: Context;
    availableCweb: bigint;
    authInfo: AuthInfo;
    requestedQuoteAmount: HexBigInt;
    quoteWallet: string;
    fallbackContractId: string;
    fallbackMethodName: string;
    nonce?: string;
}) => never[];
