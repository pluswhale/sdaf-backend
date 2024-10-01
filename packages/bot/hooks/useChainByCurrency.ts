import { useChains } from 'wagmi';

import { Currency, ERC20_TOKENS, EVM_TOKENS } from '@/constants';

const useChainByCurrency = (currency?: Currency) => {
  const evmWagmiChains = useChains();

  const collectChainData = (currency: Currency) => {
    const [token, tokenChain] = currency.split('_');

    const isNative = !tokenChain;
    const isEvm = EVM_TOKENS.some((c) => c === (tokenChain || token));
    const isERC20 = ERC20_TOKENS.some((c) => c === currency);

    const chainData = evmWagmiChains.find(
      (chain) => chain.nativeCurrency.symbol.toUpperCase() === (tokenChain || token).toUpperCase(),
    );

    return {
      isNative,
      isEvm,
      isERC20,
      chainData,
    };
  };

  // TODO: Currently only checks for EVM chain data, BTC not implemented yet
  return {
    ...(currency && collectChainData(currency)),
    findChainByCurrency: collectChainData,
  };
};

export default useChainByCurrency;
