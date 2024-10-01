import { BitcoinNetworkType, GetAddressResponse } from 'sats-connect';
import { create } from 'zustand';

import { Currency } from '@/constants';
import { BtcNetwork, NETWORK } from '@/networks/btc';

type BtcAddresses = GetAddressResponse['addresses'];

type TokenStore = {
  l1FirstToken: Currency;
  l1SecondToken: Currency;
  setL1FirstToken: (token: Currency) => void;
  setL1SecondToken: (token: Currency) => void;
  l1FirstTokenSwapAmount: bigint;
  setL1TokenSwapAmount: (value: bigint) => void;
  l1TokenWalletAmount: bigint;
  l1SecondTokenWalletAmount: bigint;
  setL1TokenWalletAmount: (amount: bigint) => void;
  setL1SecondTokenWalletAmount: (amount: bigint) => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  btcAdress: BtcAddresses;
  setBtcAdress: (address: BtcAddresses) => void;
  btcNetwork: BitcoinNetworkType;
  setBtcNetwork: (network: BitcoinNetworkType) => void;
};

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

export const useTokenStore = create<TokenStore>((set) => {
  return {
    l1FirstToken: Currency.ETH,
    l1SecondToken: Currency.BNB,
    setL1FirstToken: (token: Currency) => set({ l1FirstToken: token }),
    setL1SecondToken: (token: Currency) => set({ l1SecondToken: token }),
    l1FirstTokenSwapAmount: BigInt(0),
    setL1TokenSwapAmount: (value) => set({ l1FirstTokenSwapAmount: value }),
    l1TokenWalletAmount: BigInt(0),
    l1SecondTokenWalletAmount: BigInt(0),
    setL1TokenWalletAmount: (amount) => set({ l1TokenWalletAmount: amount }),
    setL1SecondTokenWalletAmount: (amount) => set({ l1SecondTokenWalletAmount: amount }),
    recipientAddress: '',
    setRecipientAddress: (address) => set({ recipientAddress: address }),
    btcAdress: [],
    setBtcAdress: (addresses: BtcAddresses) => set({ btcAdress: addresses }),
    btcNetwork: bitcoinNet,
    setBtcNetwork: (network) => set({ btcNetwork: network }),
  };
});
