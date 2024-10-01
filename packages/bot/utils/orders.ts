import {UIMarketOrderAsk, UIMarketOrderBid} from "../types.ts";


export const filterDustOrder = (order: UIMarketOrderAsk | UIMarketOrderBid): boolean => {
  return Math.round(order.tokenRatioL1ToCweb * Number(order.remainingCwebAmount)) > 0;
};

export const sortByOrdersRatio =
  (direction: 'asc' | 'desc' = 'asc') =>
  (a: UIMarketOrderAsk | UIMarketOrderBid, b: UIMarketOrderAsk | UIMarketOrderBid): number => {
    if (direction === 'asc') {
      return a.tokenRatioL1ToCweb - b.tokenRatioL1ToCweb;
    }

    return b.tokenRatioL1ToCweb - a.tokenRatioL1ToCweb;
  };
