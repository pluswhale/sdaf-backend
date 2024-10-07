import {BTC_TOKENS, Currency, ERC20_TOKENS, EVM_TOKENS} from "../constants/index";
import {BtcCurrency, ERC20Currency, EvmCurrency} from "../types";

export const isEvmCurrency = (currency: Currency): currency is EvmCurrency =>
  (EVM_TOKENS as unknown[]).includes(currency);

export const isErc20Currency = (currency: Currency): currency is ERC20Currency =>
  (ERC20_TOKENS as unknown[]).includes(currency);

export const isBtcCurrency = (currency: Currency): currency is BtcCurrency =>
  (BTC_TOKENS as unknown[]).includes(currency);
