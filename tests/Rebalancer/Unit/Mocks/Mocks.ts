import { WalletType } from '../../../../middlewares/walletScheduler';
import { CurrencyType } from '../../../../db/entities';

export const WBTC_wallet: WalletType = {
  id: '1',
  wallet_type: 'sending',
  currency_type: CurrencyType.WBTC,
  wallet_name: 'Test Wallet',
  pub_key: '0x123',
  address: '0x168e3f5919fC3858D7911b3e302B826f0dE6B10b',
  minBalance: '20',
  maxBalance: '60',
  rebalancingWallet: 'hwat',
  rebalancingPlatform: 'binance',
  price: {
    usd: 10,
    bnb: 0.00071137,
  },
};
