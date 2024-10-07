import { useQuery } from '@tanstack/react-query';
import { getAllUserPositions } from '../api';
import { useUserPubKey } from './useUserPubKey';
export const useGetAllUsersPositions = (currency, pagination) => {
    const queryKey = ['allUsersPositions', currency, pagination];
    const { pubKey } = useUserPubKey();
    const queryFn = async ({ queryKey }) => {
        const [, currency, pagination] = queryKey;
        if (!pubKey)
            return [];
        return getAllUserPositions(currency, pubKey, pagination).then((marketPositions) => {
            return marketPositions;
        });
    };
    return useQuery({
        queryKey,
        queryFn,
        refetchInterval: 10000,
        refetchIntervalInBackground: true,
        staleTime: 10000,
    });
};
