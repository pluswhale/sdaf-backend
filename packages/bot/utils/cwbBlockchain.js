import { mnemonicToSeedSync } from 'bip39';
//@ts-ignore
import HDKey from 'hdkey';
//@ts-ignore
import secp256k1 from 'secp256k1';
export const mnemonicToHDKey = (mnemonic) => {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    //@ts-ignore
    hdkey.sign = function (hash) {
        //@ts-ignore
        const sig = secp256k1.ecdsaSign(Uint8Array.from(hash), Uint8Array.from(hdkey.privateKey));
        const array = secp256k1.signatureNormalize(sig.signature);
        return Buffer.from(secp256k1.signatureExport(array));
    };
    return hdkey;
};
