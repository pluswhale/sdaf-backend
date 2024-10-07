import { useQuery } from '@tanstack/react-query';
import {Currency} from "../constants";
import {getBestActivePositions} from "../api";


export const useBestActivePositions = (currency: Currency) =>
  useQuery({
    queryKey: ['BestActivePositions', currency],
    queryFn: () => getBestActivePositions(currency),
    refetchInterval: 10000,
  });
