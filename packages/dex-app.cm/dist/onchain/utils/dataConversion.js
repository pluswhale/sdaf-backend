import { hexToUint8, uint8ToHex } from '@coinweb/contract-kit';
import { blake3 } from '@noble/hashes/blake3';
import { sha256 } from '@noble/hashes/sha256';
import { binary_to_base58 as binToBase58 } from 'base58-js';
import { parseL1TxData, toHex, BtcShardNetwork, } from '../../offchain/shared';
import { L1Types } from '../types';
import { getInstanceParameters } from './contract';
import { log } from './logger';
export const hashClaimBody = (args, nonce) => {
    let argsString = Object.entries(args)
        .map(([key, value]) => [key, String(value)].join(':'))
        .sort()
        .join('#');
    if (nonce) {
        argsString = argsString + `#nonce:${nonce}`;
    }
    return uint8ToHex(blake3(argsString));
};
const base64decode = (data) => {
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const string = data + '=='.slice(2 - (data.length & 3));
    let bitmap;
    let result = '';
    let r1;
    let r2;
    let i = 0;
    for (; i < string.length;) {
        bitmap =
            (b64.indexOf(string.charAt(i++)) << 18) |
                (b64.indexOf(string.charAt(i++)) << 12) |
                ((r1 = b64.indexOf(string.charAt(i++))) << 6) |
                (r2 = b64.indexOf(string.charAt(i++)));
        result +=
            r1 === 64
                ? String.fromCharCode((bitmap >> 16) & 255)
                : r2 === 64
                    ? String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255)
                    : String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255, bitmap & 255);
    }
    return result;
};
const base64ToHex = (textData) => {
    textData = base64decode(textData);
    const data = new Uint8Array(textData.length);
    for (let i = 0; i < textData.length; i++) {
        data[i] = textData.charCodeAt(i);
    }
    return Array.from(data)
        .map((i) => {
        return ('0' + i.toString(16)).slice(-2);
    })
        .join('');
};
const getEvmEventData = (body) => {
    if (body && typeof body === 'object' && 'data' in body) {
        if (typeof body.data === 'string') {
            return body.data;
        }
    }
};
const getBtcNetworkScriptHash = () => {
    const shard = getInstanceParameters().shard;
    if (!['btc', 'tbtc'].includes(shard)) {
        throw new Error('Incorrect contract instance parameters');
    }
    return BtcShardNetwork[shard].scriptHash;
};
export const btcOutputToAddress = (hex) => {
    const scriptHash = getBtcNetworkScriptHash();
    let tmp = hex;
    tmp = `${scriptHash.toString(16).padStart(2, '0')}${hex}`;
    const hex1 = hexToUint8(tmp);
    const text1 = sha256(hex1);
    const text2 = sha256(text1);
    const address = tmp + uint8ToHex(text2).slice(2, 10);
    const hex3 = hexToUint8(address);
    const str = binToBase58(hex3);
    return str;
};
export const parseEvmEventClaimBody = (body) => {
    const data = getEvmEventData(body);
    if (!data) {
        throw new Error('Invalid L1 event data');
    }
    const dataHex = base64ToHex(data);
    /*
    A dynamic type is encoding the following way: In the part dedicated to a
    given dynamic parameter, the first word will hold the offset where the
    parameter starts, then at this offset, a first word for the length of the
    value of the parameter followed by the parameter value encoded on one or
    more words.
    */
    const l1TxData = parseL1TxData(dataHex.slice(128 + 128)); // ^^^
    return {
        recipient: `0x${dataHex.slice(24, 64)}`,
        paidAmount: `0x${dataHex.slice(64, 128)}`,
        ...l1TxData,
    };
};
export const decodeMultisigOut = (asms) => {
    const chunks = asms
        .filter((asm) => /.*OP_CHECKMULTISIG/gi.test(asm))
        .flatMap((asm) => asm.split(' '))
        .filter((word) => word.length === 66)
        .map((word) => word.slice(4))
        .concat();
    const hexData = ''.concat(...chunks).replace(/ff(00)*$/gi, '');
    return hexData;
};
export const decodeOpReturnOut = (asms) => {
    return asms.find((asm) => asm.startsWith('OP_RETURN '))?.replace('OP_RETURN ', '');
};
const getBtcEventData = (body) => {
    log(body);
    if (body && typeof body === 'object' && 'UtxoBased' in body) {
        if (body.UtxoBased && typeof body.UtxoBased === 'object' && 'vout' in body.UtxoBased) {
            if (Array.isArray(body.UtxoBased.vout)) {
                const outs = body.UtxoBased.vout
                    .filter((item) => item &&
                    typeof item === 'object' &&
                    typeof item.value === 'number' &&
                    item.scriptPubKey &&
                    typeof item.scriptPubKey === 'object' &&
                    typeof item.scriptPubKey.asm === 'string')
                    .map(({ scriptPubKey: { asm }, value }) => ({ asm, value }));
                const sendFundOut = outs[outs.length - 1];
                const valueBtc = Number(sendFundOut.value) * 1e8;
                const outputHash = sendFundOut.asm.split(' ')[1];
                log(`Hash btc script: ${outputHash}`);
                const walletBtc = btcOutputToAddress(outputHash);
                let data = decodeOpReturnOut(outs.map(({ asm }) => asm));
                if (!data) {
                    data = decodeMultisigOut(outs.map(({ asm }) => asm));
                }
                if (!data) {
                    throw new Error('Incorrect event data');
                }
                const returnData = {
                    data,
                    value: toHex(BigInt(Math.trunc(valueBtc))),
                    wallet: walletBtc,
                };
                log('Btc Tx data: ', returnData);
                return returnData;
            }
        }
    }
};
export const parseBtcEventClaimBody = (body) => {
    const data = getBtcEventData(body);
    if (!data) {
        throw new Error('Invalid L1 event data');
    }
    const l1TxData = parseL1TxData(data.data);
    return {
        recipient: data.wallet,
        paidAmount: data.value,
        ...l1TxData,
    };
};
export const parseL1EventClaimBody = (body) => {
    if (getInstanceParameters().l1_type === L1Types.Btc) {
        return parseBtcEventClaimBody(body);
    }
    else {
        return parseEvmEventClaimBody(body);
    }
};
export const createBestByQuoteIndex = (base, quote) => {
    return BigInt(Number(base) * 1e18) / BigInt(quote); //TODO! Check this approach
};
