import { type QueryFunction, useQuery } from '@tanstack/react-query';
import {getMempoolTxsSpendingUtxo} from "../networks/btc";


type CheckMempoolTxsSpendingUtxoQueryKey = ['mempoolTxUtxo', string, string];

export const useCheckMempoolTxsSpendingUtxo = (txId: string, vout: string) => {
  const queryKey: CheckMempoolTxsSpendingUtxoQueryKey = ['mempoolTxUtxo', txId, vout];

  const queryFn: QueryFunction<boolean, CheckMempoolTxsSpendingUtxoQueryKey> = async ({ queryKey }) => {
    const [, txId, vout] = queryKey;

    if (!txId || !vout) return false;

    const is = await getMempoolTxsSpendingUtxo(txId, vout);

    return !!is.length;
  };

  return useQuery<boolean, Error, boolean, CheckMempoolTxsSpendingUtxoQueryKey>({
    queryKey,
    queryFn,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 10000,
  });
};
