import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

import { NETWORK } from './constants.ts';

export const embeddingScripts = (payload: Uint8Array): Array<OutScriptInfo> => {
  return embedIntoPubkeys(payload).map((keys) => createScript(keys));
};

const createScript = (keys: [Uint8Array, Uint8Array, Uint8Array]): OutScriptInfo => {
  return btc.p2ms(2, keys, true);
};

const embedIntoPubkeys = (payload: Uint8Array): Array<[Uint8Array, Uint8Array, Uint8Array]> => {
  // an uncompress pubkey is 64, but the library doesn't allow using uncompressed pubkey
  // TODO: find a way to use uncompressed pubkey.
  //
  // We use 32 bytes as a compressed address (plus a byte to indicate parity of the missing coordinate).
  // 31 bytes we use for data, while the remaining 1 is set as the lowest byte such the pubkey is valid.
  //
  // 31 bytes means 62 characters after on hexadecimal.
  // 186 because we use 3 addresses
  //
  // We use 'ff' to mark the end of the string, afterward, we add 0s till we get a multiple
  // of  186 (FIXME: this is unnecesarilly too much, as we could optimize it and
  // use 2 out of 2, or OP_RETURN for the last one)
  //
  const chunks =
    hex
      .encode(payload)
      .concat('ff')
      .match(/.{1,186}/g) || [];

  return chunks
    .map((x) => (x.length == 192 ? x : x.concat('0'.repeat(192 - x.length))))
    .map((x) => [
      createPubkey(x.slice(62 * 0, 62 * 1)),
      createPubkey(x.slice(62 * 1, 62 * 2)),
      createPubkey(x.slice(62 * 2, 62 * 3)),
    ]);
};

const createPubkey = (data: string): Uint8Array => {
  for (let i = 0; i <= 255; i++) {
    const result = new Uint8Array([3, i, ...hex.decode(data)]);

    if (validatePubkey(result)) {
      return result;
    }
  }

  throw 'Could not find pubkey';
};

const validatePubkey = (key: Uint8Array): boolean => {
  try {
    btc.p2pk(key, NETWORK.Settings);

    return true;
  } catch (_) {
    return false;
  }
};

export type OutScriptInfo = {
  type: string;
  address?: string;
  script: Uint8Array;
  redeemScript?: Uint8Array;
};
