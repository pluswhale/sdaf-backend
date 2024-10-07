import { BtcShardNetwork } from 'dex-app.cm';
import {ENV} from "../../constants";



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

const BtcExplorerMap: Record<BtcNetwork, string> = {
  [BtcNetwork.Mainnet]: 'https://mempool.space',
  [BtcNetwork.Testnet]: 'https://mempool.space/testnet',
  [BtcNetwork.Signet]: 'https://mempool.space/signet',
};

const isBtcNetwork = (value: string): value is BtcNetwork => (Object.values(BtcNetwork) as string[]).includes(value);

export const NETWORK = {
  get Network() {
    if (!isBtcNetwork('testnet' as string)) {
      throw new Error(
          'Incorrect value ' +
          ENV['BTC_NETWORK'] +
          ' for variable BTC_NETWORK. Use one of ' +
          Object.values(BtcNetwork).join(', '),
      );
    }

    return ENV['BTC_NETWORK'] || 'testnet';
  },

  get ApiEndpoint() {
    return 'https://blockstream.info/testnet/api'
    // return (ENV['BTC_API_ENDPOINT'] as string)
    //     .split('/')
    //     .map((slug) => (slug[0] === '$' ? ENV[slug.slice(1)] : slug))
    //     .join('/');
  },

  get Settings() {
    //@ts-ignore
    return BtcNetworkSettings[NETWORK.Network];
  },

  get MempoolSpendingUtxoEndpoint() {
    return 'https://utxo-catcher.coinz.team/testnet/outpoint'
    // return (ENV['BTC_MEMPOOL_SPENDING_UTXO_ENDPOINT'] as string)
    //     .split('/')
    //     .map((slug) => (slug[0] === '$' ? ENV[slug.slice(1)] : slug))
    //     .join('/');
  },

  get ExplorerUrl() {
    const network = this.Network;

    //@ts-ignore
    return BtcExplorerMap[network];
  },

  get DustLimit() {
    return Number(ENV['BTC_DUST_LIMIT']);
  },
};

export const ALLOWED_SIGN_HASH_TYPES = {
  ALL: 1,
  SINGLE_ANYONECANPAY: 131,
};
