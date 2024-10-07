/* eslint-disable no-bitwise */
const PUBKEY_HEX_LEN = 66;
const PUBKEY_BYTE_LEN = 33;
function createHexString(bytes) {
    const hex = [];
    for (let i = 0; i < bytes.length; i += 1) {
        const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xf).toString(16));
    }
    return hex.join('');
}
function parseHexString(str) {
    const bytes = [];
    for (let c = 0; c < str.length; c += 2)
        bytes.push(parseInt(str.substr(c, 2), 16));
    return bytes;
}
export function checkPubkey(data) {
    if (data.length === PUBKEY_HEX_LEN) {
        const byteRes = parseHexString(data);
        if (byteRes.length === PUBKEY_BYTE_LEN) {
            const HexRes = createHexString(byteRes);
            if (data.toLowerCase() === HexRes)
                return true;
        }
    }
    return false;
}
