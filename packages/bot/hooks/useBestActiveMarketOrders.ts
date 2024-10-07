import { useQuery } from '@tanstack/react-query';
import {Currency} from "../constants";
import {getBestActiveMarketOrders} from "../api";


export const useBestActiveMarketOrders = (currency: Currency) =>
  useQuery({
    queryKey: ['BestActiveMarketOrders', currency],
    queryFn: () => getBestActiveMarketOrders(currency),
    refetchInterval: 10000,
  });
