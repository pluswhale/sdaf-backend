import { JsonRpcProvider } from 'ethers';

export const ethProviders = {
  bscMainnet: new JsonRpcProvider('https://bsc-dataseed.binance.org'),
  bscTestnet: new JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'),
  ethMainnet: new JsonRpcProvider('https://eth.llamarpc.com'),
  ethTestnet: new JsonRpcProvider('https://rpc.sepolia.org'),
} as { [key: string]: JsonRpcProvider };

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
