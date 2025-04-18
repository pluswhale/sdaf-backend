type Providers = 'Mainnet' | 'Testnet';

const baseUrls: Partial<Record<Providers, Record<string, string>>> = {
  Mainnet: {
    BSC: 'https://bsc-dataseed.binance.org',
    ETH: 'https://ethereum-rpc.publicnode.com',
  },
  Testnet: {
    BSC: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    ETH: 'https://rpc.sepolia.org',
  },
};

const currencyGroups: { [key: string]: string[] } = {
  ETH: ['ETH', 'USDT_ERC20', 'WBTC'],
  BSC: ['BNB', 'USDT_BEP20'],
};

export const getProviderUrl = (provider: Providers, currency: string): any => {
  const currencyGroup = Object.keys(currencyGroups).find((group) => currencyGroups[group].includes(currency));

  if (currencyGroup) {
    return baseUrls?.[provider]?.[currencyGroup] || null;
  }

  return null;
};

// export const CoinWebProviders = {
//   mainnet: new JsonRpcProvider('https://geth-devnet-l1b.coinweb.io'),
//   testnet: new JsonRpcProvider('https://geth-devnet-l1b.coinweb.io'),
// } as { [key: string]: JsonRpcProvider };
//

