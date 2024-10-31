import { JsonRpcProvider } from 'ethers';
const ethProviders = {
    mainnet: new JsonRpcProvider('https://bsc-dataseed.binance.org'),
    testnet: new JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'),
};
const bitcoinProvider = {
    mainnet: '',
    testnet: '',
};
const ethProvider = ethProviders[process.env.NETWORK || 'testnet'];
export { ethProvider };
