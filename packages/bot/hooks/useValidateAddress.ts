import isBitcoinAddress from 'bitcoin-address-validation';
import { isAddress as isEvmAddress, type IsAddressOptions } from 'viem';

import { Currency } from '@/constants';
import { isBtcCurrency, isErc20Currency, isEvmCurrency } from '@/utils';

const useValidateAddress = () => {
  const validateAddress = (address: string, token: Currency, options?: IsAddressOptions) => {
    if (isBtcCurrency(token)) {
      return isBitcoinAddress(address);
    }

    if (isEvmCurrency(token) || isErc20Currency(token)) {
      return isEvmAddress(address, options as IsAddressOptions);
    }

    return false;
  };

  return validateAddress;
};

export default useValidateAddress;
