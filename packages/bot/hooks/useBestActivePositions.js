import { useQuery } from '@tanstack/react-query';
import { getBestActivePositions } from "../api";
export const useBestActivePositions = (currency) => useQuery({
    queryKey: ['BestActivePositions', currency],
    queryFn: () => getBestActivePositions(currency),
    refetchInterval: 10000,
});
