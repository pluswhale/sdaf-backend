import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Currency, TokenOrder } from '../constants';
export const useTokenCombinationFromUrl = () => {
    const { urlTokenCombination } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paramsString = searchParams.toString();
    const [l1FirstToken, l1SecondToken] = useMemo(() => {
        const l1FirstTokenDefault = Currency.BTC;
        const l1SecondTokenDefault = Currency.ETH;
        const [l1FirstToken, l1SecondToken] = (urlTokenCombination?.split('-') || []);
        return [
            (l1FirstToken && Currency[l1FirstToken]) || l1FirstTokenDefault,
            (l1FirstToken && Currency[l1SecondToken]) || l1SecondTokenDefault,
        ];
    }, [urlTokenCombination]);
    const updateUrlTokenCombination = (firstToken, secondToken) => {
        const newTokenCombination = secondToken ? `${firstToken}-${secondToken}` : firstToken;
        const newUrl = `/${newTokenCombination}?${paramsString}`;
        navigate(newUrl, { replace: true });
    };
    const updateSingleToken = (tokenOrder, token) => {
        if (tokenOrder === TokenOrder.FIRST) {
            updateUrlTokenCombination(token, l1SecondToken);
        }
        else {
            updateUrlTokenCombination(l1FirstToken, token);
        }
    };
    return {
        urlTokenCombination,
        l1FirstToken,
        l1SecondToken,
        updateUrlTokenCombination: (firstToken, secondToken) => updateUrlTokenCombination(firstToken, secondToken),
        updateSingleToken: (token, tokenOrder) => updateSingleToken(tokenOrder, token),
    };
};
