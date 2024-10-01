import { useMemo } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Currency, TokenOrder } from '../constants';

type TokenCombinationFromUrl = {
  urlTokenCombination: string | undefined;
  l1FirstToken: Currency;
  l1SecondToken: Currency;
  updateUrlTokenCombination: (firstToken: Currency, secondToken?: Currency) => void;
  updateSingleToken: (token: Currency, tokenOrder: TokenOrder) => void;
};

export const useTokenCombinationFromUrl = (): TokenCombinationFromUrl => {
  const { urlTokenCombination } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramsString = searchParams.toString();

  const [l1FirstToken, l1SecondToken] = useMemo(() => {
    const l1FirstTokenDefault = Currency.BTC;
    const l1SecondTokenDefault = Currency.ETH;
    const [l1FirstToken, l1SecondToken] = (urlTokenCombination?.split('-') || []) as [Currency, Currency];

    return [
      (l1FirstToken && Currency[l1FirstToken]) || l1FirstTokenDefault,
      (l1FirstToken && Currency[l1SecondToken]) || l1SecondTokenDefault,
    ];
  }, [urlTokenCombination]);

  const updateUrlTokenCombination = (firstToken: Currency, secondToken?: Currency): void => {
    const newTokenCombination = secondToken ? `${firstToken}-${secondToken}` : firstToken;
    const newUrl = `/${newTokenCombination}?${paramsString}`;

    navigate(newUrl, { replace: true });
  };

  const updateSingleToken = (tokenOrder: TokenOrder, token: Currency): void => {
    if (tokenOrder === TokenOrder.FIRST) {
      updateUrlTokenCombination(token, l1SecondToken);
    } else {
      updateUrlTokenCombination(l1FirstToken, token);
    }
  };

  return {
    urlTokenCombination,
    l1FirstToken,
    l1SecondToken,
    updateUrlTokenCombination: (firstToken: Currency, secondToken?: Currency) =>
      updateUrlTokenCombination(firstToken, secondToken),
    updateSingleToken: (token: Currency, tokenOrder: TokenOrder) => updateSingleToken(tokenOrder, token),
  };
};
