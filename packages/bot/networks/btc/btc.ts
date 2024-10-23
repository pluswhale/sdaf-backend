import axios from 'axios';

import { NETWORK } from './constants';

export const getSatPerVbEstimateFee = async () => {
  const req = await axios.get(`${NETWORK.ApiEndpoint}/fee-estimates`);

  return Math.round(((req.data['1'] + req.data['2']) as number) / 2);
};

type ResultUtxo = {
  status: { confirmed: boolean };
  txid: string;
  value: number;
  vout: number;
};

export const getUtxos = async (wallet: string): Promise<Array<ResultUtxo>> => {
  const req = await axios.get(`${NETWORK.ApiEndpoint}/address/${wallet}/utxo`);

  return req.data;
};

export const getMempoolTxsSpendingUtxo = async (txId: string, vout: string): Promise<Array<string>> => {
  try {
    const req = await axios.get(`${NETWORK.MempoolSpendingUtxoEndpoint}/${txId}:${vout}`);

    return req.data;
  } catch (e) {
    return [];
  }
};

export const getSmallestUnusedUtxo = async (wallet: string, utxoInUse: { l1TxId: string; vout: number }[]) => {
  let min = Number.MAX_SAFE_INTEGER;
  let number = -1;
  const utxos = await getUtxos(wallet);

  for (let i = 0; i < utxos.length; i += 1) {
    if (
        utxos[i].status.confirmed &&
        !utxoInUse.find((utxo) => utxo.l1TxId === utxos[i].txid && utxo.vout.toString() === utxos[i].vout.toString()) &&
        min > utxos[i].value
    ) {
      min = utxos[i].value;
      number = i;
    }
  }
  // need some rules for work with 'utxo not found'
  if (number === -1) throw new Error('utxo not found');

  return utxos[number];
};
