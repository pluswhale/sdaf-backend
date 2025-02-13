import { JsonRpcProvider } from 'ethers';

export const ethProviders = {
  mainnet: new JsonRpcProvider('https://bsc-dataseed.binance.org'),
  testnet: new JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'),
} as { [key: string]: JsonRpcProvider };

export const CoinWebProviders = {
  mainnet: new JsonRpcProvider('https://geth-devnet-l1b.coinweb.io'),
  testnet: new JsonRpcProvider('https://geth-devnet-l1b.coinweb.io'),
} as { [key: string]: JsonRpcProvider };

const bitcoinProvider = {
  mainnet: '',
  testnet: '',
} as { [key: string]: string };

const ethProvider = ethProviders['mainnet'];
export { ethProvider };

