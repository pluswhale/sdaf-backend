export const toHex = (amount) => {
    const hex = amount.toString(16);
    return '0x'.concat('0'.repeat(64 - hex.length)).concat(hex);
};
