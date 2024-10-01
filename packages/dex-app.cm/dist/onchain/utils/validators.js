export const validateBtcChainData = (data) => {
    return (data !== null &&
        typeof data === 'object' &&
        typeof data.l1TxId === 'string' &&
        typeof data.vout === 'number');
};
