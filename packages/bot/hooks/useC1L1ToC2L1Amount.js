import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FEE } from 'market-maker.cm';
import { Currency } from '../constants';
import { useBestActiveMarketOrders } from './useBestActiveMarketOrders';
import { useBestActivePositions } from './useBestActivePositions';
import { getMempoolTxsSpendingUtxo } from "../networks/btc";
import { calculateAmountFromRatio, calculateRatioFromBigInts } from "../utils";
export const isBtcChainData = (data) => {
    if (!data)
        return false;
    return (typeof data === 'object' &&
        'l1TxId' in data &&
        'vout' in data &&
        typeof data.l1TxId === 'string' &&
        typeof data.vout === 'number');
};
const createBlackListKey = (currency) => `${currency}_bl`;
const getBlackList = (currency) => {
    const key = createBlackListKey(currency);
    return new Set(JSON.parse(sessionStorage.getItem(key) ?? '[]'));
};
const addOrderToBlackList = (currency, orderId) => {
    const blackList = getBlackList(currency);
    blackList.add(orderId);
    // @ts-ignore
    sessionStorage.setItem(createBlackListKey(currency), JSON.stringify([...blackList]));
};
const cleanBlacklist = (currency, orderIds) => {
    const blackList = getBlackList(currency);
    if (blackList.size === 0) {
        return;
    }
    const aliveIds = new Set(orderIds);
    blackList.forEach((value) => {
        if (!aliveIds.has(value)) {
            blackList.delete(value);
        }
    });
};
const filterByBlackList = (currency, items) => {
    const blackList = getBlackList(currency);
    return items.filter(({ id }) => !blackList.has(id));
};
const useCwebToL1OfferC1 = (currency, l1Amount) => {
    //TODO: Change algorithm to use specific index
    const { data: positions = [] } = useBestActivePositions(currency);
    return useQuery({
        queryKey: ['CwebToL1OfferC1', currency, l1Amount.toString(10)],
        queryFn: async () => {
            const availablePositions = filterByBlackList(currency, positions);
            let satisfyingPositions = availablePositions.filter((position) => {
                const positionQuoteAmount = position.baseAmount && (position.funds * position.quoteAmount) / position.baseAmount;
                return positionQuoteAmount >= l1Amount;
            });
            if (currency === Currency.BTC) {
                const promises = satisfyingPositions.map(async (position) => {
                    if (isBtcChainData(position.chainData)) {
                        const { l1TxId, vout } = position.chainData;
                        const utxoTransactions = await getMempoolTxsSpendingUtxo(l1TxId, String(vout));
                        if (!utxoTransactions.length)
                            return position;
                        addOrderToBlackList(currency, position.id);
                        return false;
                    }
                    return position;
                });
                satisfyingPositions = (await Promise.all(promises)).filter((data) => !!data);
            }
            const bestOffer = satisfyingPositions.reduce((selectedOffer, position) => {
                const positionRatioCwebToL1 = calculateRatioFromBigInts(position.baseAmount, position.quoteAmount);
                // If none set, set the first one
                if (!selectedOffer) {
                    return position;
                }
                // If current position is better than replace
                if (positionRatioCwebToL1 > calculateRatioFromBigInts(selectedOffer.baseAmount, selectedOffer.quoteAmount)) {
                    return position;
                }
                return selectedOffer;
            }, null);
            if (!bestOffer) {
                return null;
            }
            const bestOfferRate = calculateRatioFromBigInts(bestOffer.baseAmount, bestOffer.quoteAmount);
            const randomSelectThreshold = 
            // @ts-ignore
            (bestOfferRate * (100 - (process.env.ORDER_RANDOM_SELECT_TOLERANCE ?? 0))) / 100;
            const selectedOffers = satisfyingPositions.filter((position) => {
                const positionRatioCwebToL1 = calculateRatioFromBigInts(position.baseAmount, position.quoteAmount);
                return positionRatioCwebToL1 >= randomSelectThreshold;
            });
            if (!selectedOffers.length) {
                return null;
            }
            const selectedOffer = selectedOffers[Math.floor(Math.random() * selectedOffers.length)];
            if (!selectedOffer.baseAmount) {
                return null;
            }
            const positionQuoteAmount = (selectedOffer.funds * selectedOffer.quoteAmount) / selectedOffer.baseAmount;
            return {
                offer: selectedOffer,
                maxQuote: positionQuoteAmount,
            };
        },
        refetchInterval: 10000,
    });
};
const useL1toCwebOfferC2 = (currency, cwebAmount) => {
    const { data: orders = [] } = useBestActiveMarketOrders(currency);
    cleanBlacklist(currency, orders.map(({ id }) => id));
    if (!cwebAmount) {
        return null;
    }
    const selectedOffer = orders.reduce((selectedOffer, order) => {
        const availableOfferCwebInOrder = order.covering;
        const orderL1ToCwebRatio = calculateRatioFromBigInts(order.quoteAmount, order.baseAmount);
        const availableOfferL1InOrder = calculateAmountFromRatio(order.covering, orderL1ToCwebRatio);
        if (cwebAmount > availableOfferCwebInOrder) {
            return selectedOffer;
        }
        if (!selectedOffer) {
            return { offer: order, maxOffer: availableOfferL1InOrder };
        }
        if (orderL1ToCwebRatio > calculateRatioFromBigInts(selectedOffer.offer.quoteAmount, selectedOffer.offer.baseAmount)) {
            return { offer: order, maxOffer: availableOfferL1InOrder };
        }
        return selectedOffer;
    }, null);
    if (!selectedOffer) {
        return null;
    }
    return selectedOffer;
};
const HACK_QUEUE_COST = 20000n;
export const useL1C1ToL1C2Amount = (l1CurrencyC1, l1CurrencyC2, l1AmountC1) => {
    const queryClient = useQueryClient();
    const queryKey = ['L1C1ToL1C2Amount', l1CurrencyC1, l1CurrencyC2, l1AmountC1.toString(10)];
    const [, cwebToL1CurrencyC1, l1ToCwebCurrencyC2, cwebToL1QuoteAmountC1] = queryKey;
    const { data: cwebToL1OfferC1 } = useCwebToL1OfferC1(cwebToL1CurrencyC1, BigInt(cwebToL1QuoteAmountC1));
    const baseAmount = cwebToL1OfferC1 &&
        (BigInt(cwebToL1QuoteAmountC1) * cwebToL1OfferC1.offer.baseAmount) / cwebToL1OfferC1.offer.quoteAmount -
            FEE.HANDLE_EXECUTION_REQUEST -
            HACK_QUEUE_COST;
    const l1ToCwebOfferC2 = useL1toCwebOfferC2(l1ToCwebCurrencyC2, baseAmount);
    const queryFn = async () => {
        if (!(cwebToL1OfferC1 && baseAmount && l1ToCwebOfferC2)) {
            throw new Error('Cannot find liquidity for this swap');
        }
        const amount = (baseAmount * l1ToCwebOfferC2.offer.quoteAmount) / l1ToCwebOfferC2.offer.baseAmount;
        const maxAmount = cwebToL1OfferC1.maxQuote < l1ToCwebOfferC2.maxOffer ? cwebToL1OfferC1.maxQuote : l1ToCwebOfferC2.maxOffer;
        return {
            amount: BigInt(amount && amount > 0 ? amount : 0),
            maxAmount,
            position: cwebToL1OfferC1.offer,
        };
    };
    return Object.assign(useQuery({
        queryKey,
        queryFn,
        refetchInterval: 10000,
    }), {
        addOrderToBlackList: (currency, orderId) => {
            addOrderToBlackList(currency, orderId);
            queryClient.removeQueries({ queryKey });
            queryClient.refetchQueries({ queryKey });
        },
    });
};
