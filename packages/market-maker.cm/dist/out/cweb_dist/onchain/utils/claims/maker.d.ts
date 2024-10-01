import { Claim, User } from '@coinweb/contract-kit';
export declare const createMakerDepositClaim: ({ amount, user }: {
    user: User;
    amount: bigint;
}) => Claim;
