import { hex, base64 } from '@scure/base';
import * as btc from '@scure/btc-signer';
import axios from 'axios';
// @ts-ignore
import { request } from 'sats-connect';

import { NETWORK } from './constants.ts';
import { embeddingScripts } from './txOutputEncoding.ts';

async function getEstimateFee() {
  const req = await axios.get(`${NETWORK.ApiEndpoint}/fee-estimates`);

  return Math.ceil(req.data['1'] * 2);
}

type ResultUtxo = {
  status: { confirmed: boolean };
  txid: string;
  value: number;
  vout: number;
};

async function GetUtxo(wallet: string): Promise<Array<ResultUtxo>> {
  const req = await axios.get(`${NETWORK.ApiEndpoint}/address/${wallet}/utxo`);

  return req.data;
}

export async function getMempoolTxsSpendingUtxo(txId: string, vout: string): Promise<Array<string>> {
  try {
    const req = await axios.get(`${NETWORK.MempoolSpendingUtxoEndpoint}/${txId}:${vout}`);

    return req.data;
  } catch (e) {
    return [];
  }
}

async function calculateFees(wallet: string, output: number, useUtxo?: string) {
  const utxos = await GetUtxo(wallet);

  const feeEstimate = await getEstimateFee();

  let sum = 0;
  const utxosUses = [];
  const INPUTBYTE = 148;
  const OUTPUTBYTE = 2 * 34;
  const HEADERBYTE = 10;
  let vbyte = OUTPUTBYTE + HEADERBYTE;
  // need some rules for work with utxo
  let useOneUtxo = false;

  if (useUtxo) {
    const utxo = utxos.find((utxo) => utxo.txid === useUtxo);

    if (utxo) {
      sum += utxo.value;
      utxosUses.push(utxo);
      vbyte += INPUTBYTE;
      if (output + vbyte * feeEstimate <= sum) useOneUtxo = true;
    }
  }

  for (let i = 0; i < utxos.length; i += 1) {
    if (useOneUtxo) break;
    if (utxos[i].txid === useUtxo) continue;
    if (utxos[i].status.confirmed && Number(utxos[i].value) > 3000) {
      sum += utxos[i].value;
      utxosUses.push(utxos[i]);
      vbyte += INPUTBYTE;
      if (output + vbyte * feeEstimate <= sum) break;
    }
  }

  if (output > sum) {
    throw new Error(`Not enough funds: ${output - sum}`);
  }

  if (output + vbyte * feeEstimate > sum) {
    throw new Error('Not enough funds to pay fees');
  }

  // TODO: Estimate the vbyte properly
  // tx vbytes are ~800, this code calculates ~226 for one utxo
  const hackIncreaseFeesByFactor = 4;

  return { utxos: utxosUses, fee: hackIncreaseFeesByFactor * vbyte * feeEstimate };
}

export async function getSmallUtxo(wallet: string, utxoUse: string[]) {
  let min = Number.MAX_SAFE_INTEGER;
  let number = -1;
  const utxos = await GetUtxo(wallet);

  for (let i = 0; i < utxos.length; i += 1) {
    if (utxos[i].status.confirmed && !utxoUse.includes(utxos[i].txid) && min > utxos[i].value) {
      min = utxos[i].value;
      number = i;
    }
  }
  // need some rules for work with 'utxo not found'
  if (number === -1) throw new Error('utxo not found');

  return utxos[number];
}

export async function getPsbtStartTransaction(
  wallet: string,
  // walletRecipient: string,
  publicKey: string,
  // output: string,
  useUtxo?: string[],
) {
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

  const psbt = tx.toPSBT(0);
  const psbtB64 = base64.encode(psbt);

  return { utxoId: utxo.txid, vout: utxo.vout, psbtB64, sighTx: [0] };
}

export async function createFullPsbt(
  psbtBase64: string,
  publicKey: string,
  changeAddress: string,
  recipient: string,
  wallet: string,
  output: number,
  args: Uint8Array,
) {
  //const oldPsbt = 'cHNidP8BAFMCAAAAAZUD3Ky7fWQo3bvJiQKngtStjqcfVeCZx9AONjMxZK1AAAAAAAD/////AdguAAAAAAAAF6kUMN9L4/AI2byfdC7PYLdiWdhP26SHAAAAAAABASDYLgAAAAAAABepFDDfS+PwCNm8n3Quz2C3YlnYT9ukhyICA2Px93JzMWqgXTy2zQgFtk7evjAqTsXUNeul+YjiTzCLRzBEAiAcDyQQt7De8HxklRT3KAlkcdPZW5eA084gwTpJENLzzwIgeHlg6ORO26uYzJKdF12qxRvjZoqI6QmhWG816SbkRiqDAQMEgwAAAAEEFgAUmBjGuJsWSH1qJyjkuAIjHcB97B8AAA==';
  const tx = btc.Transaction.fromPSBT(base64.decode(psbtBase64), {
    allowUnknownOutputs: true,
    disableScriptCheck: true,
  });

  const dustPerOutput = 800; // 547 did not work
  let dustLost = 0;

  for (const scriptedData of embeddingScripts(args).values()) {
    dustLost = dustLost + dustPerOutput;

    tx.addOutput({
      script: scriptedData.script,
      amount: BigInt(dustPerOutput),
      redeemScript: undefined,
    });
  }

  const internalPubKey = hex.decode(publicKey);
  const p2wpkh = btc.p2wpkh(internalPubKey, NETWORK.Settings);
  const p2sh = btc.p2sh(p2wpkh, NETWORK.Settings);

  const { utxos, fee: someFee } = await calculateFees(wallet, output + dustLost);

  const sighTx = [];
  let sum = 0;

  for (let i = 0; i < utxos.length; i += 1) {
    sighTx.push(i + 1);
    tx.addInput({
      txid: utxos[i].txid,
      index: utxos[i].vout,
      witnessUtxo: {
        script: p2sh.script,
        amount: BigInt(utxos[i].value),
      },
      redeemScript: p2sh.redeemScript,
    });
    sum += utxos[i].value;
  }

  if (sum - output - someFee > 0) {
    tx.addOutputAddress(changeAddress, BigInt(sum - output - someFee - dustLost), NETWORK.Settings);
  }

  tx.addOutputAddress(recipient, BigInt(output), NETWORK.Settings);

  const psbt = tx.toPSBT(0);
  const psbtB64 = base64.encode(psbt);

  return { psbtB64, sighTx };
}

export async function createFinalisePsbt(
  publicKey: string,
  changeAddress: string,
  wallet: string,
  output: number,
  utxoId: string,
  utxoUse: string[],
) {
  const tx = new btc.Transaction();
  const internalPubKey = hex.decode(publicKey);
  const p2wpkh = btc.p2wpkh(internalPubKey, NETWORK.Settings);
  const p2sh = btc.p2sh(p2wpkh, NETWORK.Settings);

  const { utxos, fee: someFee } = await calculateFees(wallet, output, utxoId);
  const utxo = await getSmallUtxo(wallet, utxoUse);
  const sighTx = [];
  let sum = 0;

  for (let i = 0; i < utxos.length; i += 1) {
    sighTx.push(i + 1);
    tx.addInput({
      txid: utxos[i].txid,
      index: utxos[i].vout,
      witnessUtxo: {
        script: p2sh.script,
        amount: BigInt(utxos[i].value),
      },
      redeemScript: p2sh.redeemScript,
    });
    sum += utxos[i].value;
  }

  const outputScript = hex.encode(btc.Script.encode(['RETURN', hex.decode(utxo.txid)]));

  tx.addOutput({
    script: outputScript,
    amount: BigInt(0),
    redeemScript: p2sh.redeemScript,
  });

  if (sum - output - someFee > 0) tx.addOutputAddress(changeAddress, BigInt(sum - output - someFee), NETWORK.Settings);

  const psbt = tx.toPSBT(0);
  const psbtB64 = base64.encode(psbt);

  return { psbtB64, sighTx };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSignPsbt(psbtB64: any, address: any, sighTx: any, broadcast: boolean = false) {
  try {
    const response = await request('signPsbt', {
      psbt: psbtB64,
      allowedSignHash: btc.SigHash.SINGLE_ANYONECANPAY,
      signInputs: {
        [address]: sighTx,
      },
      broadcast,
    });

    if (broadcast) return response;
    if (response.status === 'success') {
      return response.result.psbt;
      /* console.log(response.result.psbt, 'response.result.psbt');
      console.log(base64.decode(response.result.psbt), 'decode');
      const tx = btc.Transaction.fromPSBT(base64.decode(response.result.psbt));
      //const psbt = tx.toPSBT(0)
      tx.finalize();
      console.log(tx, 'tx');
      console.log(tx.hex, 'tx hex');
      console.log(tx.vsize, 'tx.vsize');
      console.log('success'); */
    } else {
      // eslint-disable-next-line no-console
      console.error('response.error.code:', response.error.code);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSignPsbtFull(psbtB64: any, address: any, sighTx: any, broadcast: boolean = false) {
  try {
    const response = await request('signPsbt', {
      psbt: psbtB64,
      allowedSignHash: btc.SigHash.ALL,
      signInputs: {
        [address]: sighTx,
      },
      broadcast,
    });

    if (broadcast) return response;
    if (response.status === 'success') {
      return response.result.psbt;
      /* console.log(response.result.psbt, 'response.result.psbt');
      console.log(base64.decode(response.result.psbt), 'decode');
      const tx = btc.Transaction.fromPSBT(base64.decode(response.result.psbt));
      //const psbt = tx.toPSBT(0)
      tx.finalize();
      console.log(tx, 'tx');
      console.log(tx.hex, 'tx hex');
      console.log(tx.vsize, 'tx.vsize');
      console.log('success'); */
    } else {
      // eslint-disable-next-line no-console
      console.error('response.error.code:', response.error.code);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
}
