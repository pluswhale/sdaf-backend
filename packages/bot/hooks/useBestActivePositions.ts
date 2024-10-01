import { useQuery } from '@tanstack/react-query';

import { getBestActivePositions } from '@/api';
import { Currency } from '@/constants';

export const useBestActivePositions = (currency: Currency) =>
  useQuery({
    queryKey: ['BestActivePositions', currency],
    queryFn: () => getBestActivePositions(currency),
    refetchInterval: 10000,
  });
