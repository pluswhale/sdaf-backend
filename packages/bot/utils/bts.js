import { hex, base64 } from '@scure/base';
import * as btc from '@scure/btc-signer';
import axios from 'axios';
import { NETWORK } from "../networks/btc";
async function GetUtxo(wallet) {
    const req = await axios.get(`${NETWORK.ApiEndpoint}/address/${wallet}/utxo`);
    return req.data;
}
export async function getSmallUtxo(wallet, utxoUse) {
    let min = Number.MAX_SAFE_INTEGER;
    const minUtxo = 800;
    let number = -1;
    const utxos = await GetUtxo(wallet);
    for (let i = 0; i < utxos.length; i += 1) {
        if (utxos[i].status.confirmed &&
            !utxoUse.find((utxo) => utxo.l1TxId === utxos[i].txid && utxo.vout.toString() === utxos[i].vout.toString()) &&
            min > utxos[i].value &&
            utxos[i].value >= minUtxo) {
            min = utxos[i].value;
            number = i;
        }
    }
    // need some rules for work with 'utxo not found'
    if (number === -1)
        throw new Error('utxo not found');
    console.log(utxos[number], `utxos[${number}]`);
    return utxos[number];
}
export async function getPsbtStartTransaction(wallet, 
// walletRecipient: string,
publicKey, privKey, 
// output: string,
useUtxo) {
    const tx = new btc.Transaction();
    const internalPubKey = hex.decode(publicKey);
    const p2wpkh = btc.p2wpkh(internalPubKey, NETWORK.Settings);
    const p2sh = btc.p2sh(p2wpkh, NETWORK.Settings);
    const utxo = await getSmallUtxo(wallet, useUtxo ?? []);
    tx.addInput({
        txid: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
            script: p2sh.script,
            amount: BigInt(utxo.value),
        },
        redeemScript: p2sh.redeemScript,
        sighashType: btc.SigHash.SINGLE_ANYONECANPAY,
    });
    tx.addOutputAddress(wallet, BigInt(utxo.value), NETWORK.Settings);
    // tx.addOutputAddress(walletRecipient, btc.Decimal.decode(output), bitcoinNet)
    tx.signIdx(privKey, 0, [btc.SigHash.SINGLE_ANYONECANPAY]);
    // tx.finalize();
    const psbt = tx.toPSBT(0);
    const psbtB64 = base64.encode(psbt);
    return { utxoId: utxo.txid, vout: utxo.vout, psbtB64 };
}
