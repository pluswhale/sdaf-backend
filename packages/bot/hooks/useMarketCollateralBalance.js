import { useQuery } from '@tanstack/react-query';
import { getAllMarketCollateralBalance } from '../api';
export const useMarketCollateralBalance = (l1Currency, pubKey, pagination) => {
    const queryKey = ['marketCollateralBalance', l1Currency, pubKey ?? undefined, pagination];
    const queryFn = async ({ queryKey }) => {
        const [, l1Currency, coinwebPubKey, pagination] = queryKey;
        if (!coinwebPubKey)
            return null;
        const data = await getAllMarketCollateralBalance(l1Currency, coinwebPubKey, pagination);
        return BigInt(data?.content?.fees_stored).toString();
    };
    return useQuery({ queryKey, queryFn, refetchInterval: 30000 });
};
