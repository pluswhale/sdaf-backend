export const truncateMidAddressInputValue = (walletAddressValue, MAX_ADDRESS_INPUT_LENGTH = 13, TRUNCATE_SYMBOL = '...') => {
    const preprocessedWalletAddressValue = walletAddressValue?.trim() || '';
    if (!preprocessedWalletAddressValue || preprocessedWalletAddressValue.length <= MAX_ADDRESS_INPUT_LENGTH) {
        return preprocessedWalletAddressValue;
    }
    const truncateLength = (MAX_ADDRESS_INPUT_LENGTH - TRUNCATE_SYMBOL.length) / 2;
    const addressHead = preprocessedWalletAddressValue.slice(0, truncateLength);
    const addressTail = preprocessedWalletAddressValue.slice(-truncateLength);
    return addressHead.concat(TRUNCATE_SYMBOL).concat(addressTail);
};
