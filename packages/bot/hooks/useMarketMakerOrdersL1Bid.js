import { useQuery } from '@tanstack/react-query';
import { getAllUserPositions } from '../api';
import { calculateAmountFromRatio, calculateRatioFromBigInts } from "../utils";
export const useMarketMakerOrdersL1Bid = (currency, pubKey, pagination) => {
    const queryKey = ['userPositions', currency, pubKey ?? undefined, pagination];
    const queryFn = async ({ queryKey }) => {
        const [, currency, pubKey, pagination] = queryKey;
        if (!pubKey) {
            return [];
        }
        return getAllUserPositions(currency, pubKey, pagination);
    };
    return useQuery({
        queryKey,
        queryFn,
        refetchInterval: 10000,
    });
};
export const useMarketMakerOrdersL1BidFormatted = (currency, pubKey, pagination) => {
    const { data, ...rest } = useMarketMakerOrdersL1Bid(currency, pubKey, pagination);
    if (!data) {
        return { ...rest, data: [] };
    }
    const formattedData = data.map((order) => {
        const tokenRatioL1ToCweb = calculateRatioFromBigInts(order.quoteAmount, order.baseAmount);
        const baseCwebAmount = BigInt(order.baseAmount);
        const quoteL1Amount = BigInt(order.quoteAmount);
        const remainingCwebAmount = BigInt(order.funds);
        const remainingL1Amount = calculateAmountFromRatio(order.funds, tokenRatioL1ToCweb);
        return {
            id: order.id,
            baseCwebAmount,
            quoteL1Amount,
            remainingCwebAmount,
            remainingL1Amount,
            tokenRatioL1ToCweb,
            createdAt: order.createdAt,
            recipientAddress: order.recipient,
            status: order.activityStatus,
            paymentStatus: order.paymentStatus,
            l1Token: currency,
            chainData: order.chainData,
            txId: order.txId,
            error: order.error,
        };
    });
    return { ...rest, data: formattedData };
};
