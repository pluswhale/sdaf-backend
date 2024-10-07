import { Currency } from './enums';

export const DEX_FRONTED_URL = 'https://cwap.io';

export const EVM_TOKENS = [Currency.ETH, Currency.BNB] as const satisfies Currency[];

export const ERC20_TOKENS = [Currency.USDT_ETH, Currency.USDT_BNB] as const satisfies Currency[];

export const BTC_TOKENS = [Currency.BTC] as const satisfies Currency[];

export const LTC_TOKENS = [Currency.LTC] as const satisfies Currency[];
