import { ethers } from 'ethers';
const DEVNET_L1A_CHAIN = {
    id: 1892,
    name: 'Devnet L1A',
    rpcUrl: 'https://geth-devblue-l1a.coinhq.store/',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
};
const DEVNET_L1B_CHAIN = {
    id: 1893,
    name: 'Devnet L1B',
    rpcUrl: 'https://geth-devblue-l1b.coinhq.store/',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
};
export const providers = {
    //@ts-ignore
    L1A: new ethers.providers.JsonRpcProvider(DEVNET_L1A_CHAIN.rpcUrl),
    //@ts-ignore
    L1B: new ethers.providers.JsonRpcProvider(DEVNET_L1B_CHAIN.rpcUrl),
};
export async function getL1ABlockNumber() {
    const blockNumber = await providers.L1A.getBlockNumber();
    console.log('Current block number on L1A:', blockNumber);
}
export async function getL1BBlockNumber() {
    const blockNumber = await providers.L1B.getBlockNumber();
    console.log('Current block number on L1B:', blockNumber);
}
