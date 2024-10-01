import { useQuery } from '@tanstack/react-query';

import { getBestActiveMarketOrders } from '@/api';
import { Currency } from '@/constants';

export const useBestActiveMarketOrders = (currency: Currency) =>
  useQuery({
    queryKey: ['BestActiveMarketOrders', currency],
    queryFn: () => getBestActiveMarketOrders(currency),
    refetchInterval: 10000,
  });
