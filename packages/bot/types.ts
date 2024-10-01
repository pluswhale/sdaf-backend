import type { User } from '@coinweb/wallet-lib';
import type { ACTIVITY_STATUS, ChainData, HexBigInt, PAYMENT_STATUS } from 'dex-app.cm/src/offchain/index.ts';
import type { ORDER_ACTIVITY_STATUS, REQUEST_EXECUTION_STATUS } from 'market-maker.cm';

import { BTC_TOKENS, Currency, ERC20_TOKENS, EVM_TOKENS, LTC_TOKENS } from './constants';

export type EvmCurrency = (typeof EVM_TOKENS)[number];

export type ERC20Currency = (typeof ERC20_TOKENS)[number];

export type BtcCurrency = (typeof BTC_TOKENS)[number];

export type LtcCurrency = (typeof LTC_TOKENS)[number];

export type EthereumContractAddress = `0x${string}`;

export type EvmContractAddress = EthereumContractAddress;

export type UIMarketOrder<T = Record<string, unknown>> = {
    id: string;
    baseCwebAmount: bigint;
    quoteL1Amount: bigint;
    remainingL1Amount: bigint;
    remainingCwebAmount: bigint;
    createdAt: number;
    tokenRatioL1ToCweb: number;
    expirationDate?: number;
    l1Token: Currency;
    chainData?: ChainData;
    txId: string;
    error?: string | null;
    isLoggedInUserPosition?: boolean;
} & T;

export type MarketOrderAskSpecifics = {
    status: ORDER_ACTIVITY_STATUS;
    remainingCollateral: bigint;
    l1Amount: HexBigInt;
    owner: User; // TODO: something is wrong in the types source, unknown
    baseWallet: string;
};
export type MarketOrderBidSpecifics = {
    status: ACTIVITY_STATUS;
    recipientAddress: string;
    paymentStatus: PAYMENT_STATUS;
};

export type UIMarketOrderBid = UIMarketOrder<MarketOrderBidSpecifics>;

export type MarketOrderAskPACT = {
    id: string;
    baseCwebAmount: bigint;
    quoteL1Amount: bigint;
    collateral: bigint;
    orderId: string;
    quoteWallet: string;
    createdAt: number;
    expirationDate: number;
    status: REQUEST_EXECUTION_STATUS;
    fallbackContractId: string;
    fallbackMethodName: string;
    l1Token: Currency;
    txId: string;
};

export type UIMarketOrderAsk = UIMarketOrder<MarketOrderAskSpecifics> & { existingPACTs?: MarketOrderAskPACT[] };