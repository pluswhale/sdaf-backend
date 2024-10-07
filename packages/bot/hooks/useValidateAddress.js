import isBitcoinAddress from 'bitcoin-address-validation';
import { isAddress as isEvmAddress } from 'viem';
import { isBtcCurrency, isErc20Currency, isEvmCurrency } from "../utils";
const useValidateAddress = () => {
    const validateAddress = (address, token, options) => {
        if (isBtcCurrency(token)) {
            return isBitcoinAddress(address);
        }
        if (isEvmCurrency(token) || isErc20Currency(token)) {
            return isEvmAddress(address, options);
        }
        return false;
    };
    return validateAddress;
};
export default useValidateAddress;
