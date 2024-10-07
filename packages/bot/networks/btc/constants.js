import { BtcShardNetwork } from 'dex-app.cm';
import { ENV } from "../../constants";
export var BtcNetwork;
(function (BtcNetwork) {
    BtcNetwork["Mainnet"] = "mainnet";
    BtcNetwork["Testnet"] = "testnet";
    BtcNetwork["Signet"] = "signet";
})(BtcNetwork || (BtcNetwork = {}));
export const BtcNetworkSettings = {
    [BtcNetwork.Mainnet]: BtcShardNetwork.btc,
    [BtcNetwork.Testnet]: BtcShardNetwork.tbtc,
    [BtcNetwork.Signet]: BtcShardNetwork.tbtc,
};
const BtcExplorerMap = {
    [BtcNetwork.Mainnet]: 'https://mempool.space',
    [BtcNetwork.Testnet]: 'https://mempool.space/testnet',
    [BtcNetwork.Signet]: 'https://mempool.space/signet',
};
const isBtcNetwork = (value) => Object.values(BtcNetwork).includes(value);
export const NETWORK = {
    get Network() {
        if (!isBtcNetwork('testnet')) {
            throw new Error('Incorrect value ' +
                ENV['BTC_NETWORK'] +
                ' for variable BTC_NETWORK. Use one of ' +
                Object.values(BtcNetwork).join(', '));
        }
        return ENV['BTC_NETWORK'] || 'testnet';
    },
    get ApiEndpoint() {
        return 'https://blockstream.info/testnet/api';
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
        return 'https://utxo-catcher.coinz.team/testnet/outpoint';
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
