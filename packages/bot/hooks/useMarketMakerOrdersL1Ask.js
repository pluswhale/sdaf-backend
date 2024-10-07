import { useQuery } from '@tanstack/react-query';
import { getMarketMakerOrders } from '../api';
import { calculateAmountFromRatio, calculateRatioFromBigInts } from "../utils";
export const useMarketMakerOrdersL1Ask = (currency, pubKey, pagination) => {
    const queryKey = ['marketMakerOrders', currency, pubKey ?? undefined, pagination];
    const queryFn = async ({ queryKey }) => {
        const [, currency, coinwebPubKey, pagination] = queryKey;
        if (!coinwebPubKey)
            return null;
        return await getMarketMakerOrders(currency, coinwebPubKey, pagination);
    };
    return useQuery({
        queryKey,
        queryFn,
        refetchInterval: 10000,
    });
};
export const useMarketMakerOrdersL1AskFormatted = (currency, pubKey, pagination) => {
    const { data, ...rest } = useMarketMakerOrdersL1Ask(currency, pubKey, pagination);
    if (!data) {
        return { ...rest, data: [] };
    }
    const formattedData = data.map((order) => {
        const tokenRatioL1ToCweb = calculateRatioFromBigInts(order.quoteAmount, order.baseAmount);
        const baseCwebAmount = BigInt(order.baseAmount);
        const quoteL1Amount = BigInt(order.quoteAmount);
        const remainingCwebAmount = BigInt(order.covering);
        const remainingL1Amount = calculateAmountFromRatio(order.covering, tokenRatioL1ToCweb);
        const remainingCollateral = BigInt(order.collateral);
        return {
            id: order.id,
            status: order.activityStatus,
            createdAt: order.createdAt,
            expirationDate: order.expirationDate,
            tokenRatioL1ToCweb,
            baseCwebAmount,
            quoteL1Amount,
            remainingCwebAmount,
            remainingL1Amount,
            remainingCollateral,
            l1Amount: order.l1Amount,
            owner: order.owner,
            baseWallet: order.baseRecipient.payload,
            l1Token: currency,
            txId: order.txId,
        };
    });
    return {
        data: formattedData,
        ...rest,
    };
};
