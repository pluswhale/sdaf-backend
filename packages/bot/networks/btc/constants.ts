import { BtcShardNetwork } from 'dex-app.cm/src/offchain/index.ts';
import {ENV} from "../../constants/index.ts";



export enum BtcNetwork {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Signet = 'signet',
}

export const BtcNetworkSettings = {
  [BtcNetwork.Mainnet]: BtcShardNetwork.btc,
  [BtcNetwork.Testnet]: BtcShardNetwork.tbtc,
  [BtcNetwork.Signet]: BtcShardNetwork.tbtc,
} as const;

const isBtcNetwork = (value: string): value is BtcNetwork => (Object.values(BtcNetwork) as string[]).includes(value);

export const NETWORK = {
  get Network() {
    if (!isBtcNetwork(ENV['VITE_BTC_NETWORK'])) {
      throw new Error(
        'Incorrect value ' +
          ENV['VITE_BTC_NETWORK'] +
          ' for variable VITE_BTC_NETWORK. Use one of ' +
          Object.values(BtcNetwork).join(', '),
      );
    }

    return ENV['VITE_BTC_NETWORK'];
  },

  get ApiEndpoint() {
    return (ENV['VITE_BTC_API_ENDPOINT'] as string)
      .split('/')
      .map((slug) => (slug[0] === '$' ? ENV[slug.slice(1)] : slug))
      .join('/');
  },

  get Settings() {
    return BtcNetworkSettings[NETWORK.Network];
  },

  get MempoolSpendingUtxoEndpoint() {
    return (ENV['VITE_BTC_MEMPOOL_SPENDING_UTXO_ENDPOINT'] as string)
      .split('/')
      .map((slug) => (slug[0] === '$' ? ENV[slug.slice(1)] : slug))
      .join('/');
  },
};
