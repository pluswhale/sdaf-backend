import { validate } from 'crypto-address-validators';

import { Currency } from '../constants';

export const validateWalletAddress = (currency: Currency, wallet: string): boolean => {
  switch (currency) {
    case Currency.ETH:
      return validate(wallet, 'ETH') && wallet.startsWith('0x');
    case Currency.USDT_BNB:
      return validate(wallet, 'USDT', 'ERC20') && wallet.startsWith('0x');
    case Currency.USDT_ETH:
      return validate(wallet, 'USDT', 'ERC20') && wallet.startsWith('0x');
    case Currency.BNB:
      return wallet.length > 40;
    case Currency.BTC:
      return true;

    default:
      return false;
  }
};
