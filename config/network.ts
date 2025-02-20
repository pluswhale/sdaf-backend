import { JsonRpcProvider } from 'ethers';

export type Providers = 'bscMainnet' | 'bscTestnet' | 'ethTestnet' | 'ethMainnet';

export const ethProviders: Partial<Record<Providers, JsonRpcProvider>> = {
  bscMainnet: new JsonRpcProvider('https://bsc-dataseed.binance.org'),
  bscTestnet: new JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'),
  ethMainnet: new JsonRpcProvider('https://ethereum-rpc.publicnode.com'),
  ethTestnet: new JsonRpcProvider('https://rpc.sepolia.org'),
};

export const CoinWebProviders = {
  mainnet: new JsonRpcProvider('https://geth-devnet-l1b.coinweb.io'),
  testnet: new JsonRpcProvider('https://geth-devnet-l1b.coinweb.io'),
} as { [key: string]: JsonRpcProvider };

const bitcoinProvider = {
  mainnet: '',
  testnet: '',
} as { [key: string]: string };

const ethProvider = ethProviders['bscMainnet'];
export { ethProvider };
