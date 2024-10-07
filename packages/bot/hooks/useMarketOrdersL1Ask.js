import { useQuery } from '@tanstack/react-query';
import { getActiveMarketOrders } from '../api';
import { useGetAllUsersPositions } from './useGetAllUsersPositions';
import { calculateAmountFromRatio, calculateRatioFromBigInts } from "../utils";
// MOCKS - start
const mockedOrders = []
    .concat(
// @ts-ignore
[...Array(5)].map(() => ({
    id: `${Math.random() * 1000}`,
    recipient: '',
    baseAmount: BigInt(Number(Math.random() * (4 - 1) + 4) * 10e18),
    quoteAmount: BigInt(Number(Math.random() * (0.2 - 0.1) + 0.1) * 10e18),
    collateral: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
    covering: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
})))
    .concat(
// @ts-ignore
[...Array(5)].map(() => ({
    id: `${Math.random() * 1000}`,
    recipient: '',
    baseAmount: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
    quoteAmount: BigInt(Number(Math.random() * (1 - 0.7) + 0.7) * 10e18),
    collateral: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
    covering: BigInt(Number(Math.random() * (80 - 50) + 50) * 10e18),
})));
// MOCKS - end
export const useMarketOrdersL1Ask = (currency, pagination) => {
    const queryKey = ['marketOrders', currency, pagination];
    const queryFn = async ({ queryKey }) => {
        const [, currency, pagination] = queryKey;
        return await getActiveMarketOrders(currency, pagination).then((marketOrders) => {
            // if ((window as CustomWindow).__MOCKS__ === true) {
            //   return (marketOrders || []).concat(mockedOrders);
            // }
            return marketOrders;
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
export const useMarketOrdersL1AskFormatted = (currency, pagination) => {
    const { data, ...rest } = useMarketOrdersL1Ask(currency, pagination);
    const { data: userPositionsData } = useGetAllUsersPositions(currency, pagination);
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
        const isLoggedInUserPosition = !!userPositionsData?.find((position) => position.id === order.id);
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
            isLoggedInUserPosition,
        };
    });
    return {
        data: formattedData,
        ...rest,
    };
};
