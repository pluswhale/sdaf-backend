import { useQuery } from '@tanstack/react-query';
import { getMempoolTxsSpendingUtxo } from "../networks/btc";
export const useCheckMempoolTxsSpendingUtxo = (txId, vout) => {
    const queryKey = ['mempoolTxUtxo', txId, vout];
    const queryFn = async ({ queryKey }) => {
        const [, txId, vout] = queryKey;
        if (!txId || !vout)
            return false;
        const is = await getMempoolTxsSpendingUtxo(txId, vout);
        return !!is.length;
    };
    return useQuery({
        queryKey,
        queryFn,
        refetchInterval: 10000,
        refetchIntervalInBackground: true,
        staleTime: 10000,
    });
};
