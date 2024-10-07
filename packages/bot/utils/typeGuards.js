import { BTC_TOKENS, ERC20_TOKENS, EVM_TOKENS } from "../constants/index";
export const isEvmCurrency = (currency) => EVM_TOKENS.includes(currency);
export const isErc20Currency = (currency) => ERC20_TOKENS.includes(currency);
export const isBtcCurrency = (currency) => BTC_TOKENS.includes(currency);
