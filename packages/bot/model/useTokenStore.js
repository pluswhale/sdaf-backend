import { BitcoinNetworkType } from 'sats-connect';
import { create } from 'zustand';
import { BtcNetwork, NETWORK } from "../networks/btc";
import { Currency } from "../constants";
const bitcoinNet = (() => {
    switch (NETWORK.Network) {
        case BtcNetwork.Mainnet:
            return BitcoinNetworkType.Mainnet;
        case BtcNetwork.Testnet:
            return BitcoinNetworkType.Testnet;
        case BtcNetwork.Signet:
            return BitcoinNetworkType.Signet;
        default:
            throw new Error('Unknown BitcoinNetworkType');
    }
})();
export const useTokenStore = create((set) => {
    return {
        l1FirstToken: Currency.ETH,
        l1SecondToken: Currency.BNB,
        setL1FirstToken: (token) => set({ l1FirstToken: token }),
        setL1SecondToken: (token) => set({ l1SecondToken: token }),
        l1FirstTokenSwapAmount: BigInt(0),
        setL1TokenSwapAmount: (value) => set({ l1FirstTokenSwapAmount: value }),
        l1TokenWalletAmount: BigInt(0),
        l1SecondTokenWalletAmount: BigInt(0),
        setL1TokenWalletAmount: (amount) => set({ l1TokenWalletAmount: amount }),
        setL1SecondTokenWalletAmount: (amount) => set({ l1SecondTokenWalletAmount: amount }),
        recipientAddress: '',
        setRecipientAddress: (address) => set({ recipientAddress: address }),
        btcAdress: [],
        setBtcAdress: (addresses) => set({ btcAdress: addresses }),
        btcNetwork: bitcoinNet,
        setBtcNetwork: (network) => set({ btcNetwork: network }),
    };
});
