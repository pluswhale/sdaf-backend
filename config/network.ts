import { JsonRpcProvider } from 'ethers';

type Providers = 'Mainnet' | 'Testnet';

const baseUrls: Partial<Record<Providers, Record<string, JsonRpcProvider>>> = {
  Mainnet: {
    BSC: new JsonRpcProvider('https://bsc-dataseed.binance.org'),
    ETH: new JsonRpcProvider('https://ethereum-rpc.publicnode.com'),
  },
  Testnet: {
    BSC: new JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'),
    ETH: new JsonRpcProvider('https://rpc.sepolia.org'),
  },
};

const currencyGroups: { [key: string]: string[] } = {
  ETH: ['ETH', 'USDT_ERC20', 'WBTC', 'USDC_ERC20', 'USD1_ERC20'],
  BSC: ['BNB', 'USDT_BEP20', 'USDC_BEP20', 'USD1_BEP20'],
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
