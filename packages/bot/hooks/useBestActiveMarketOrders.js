import { useQuery } from '@tanstack/react-query';
import { getBestActiveMarketOrders } from "../api";
export const useBestActiveMarketOrders = (currency) => useQuery({
    queryKey: ['BestActiveMarketOrders', currency],
    queryFn: () => getBestActiveMarketOrders(currency),
    refetchInterval: 10000,
});
