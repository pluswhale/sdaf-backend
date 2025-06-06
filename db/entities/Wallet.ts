import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum WalletType {
  RECEIVING = 'receiving',
  SENDING = 'sending',
}

export enum CurrencyType {
  BTC = 'BTC',
  BTC_T = 'BTC_T',
  USDT = 'USDT',
  USDT_BEP20 = 'USDT_BEP20',
  USDT_CT = 'USDT_CT',
  USDT_T = 'USDT_T',
  USDT_TRC20 = 'USDT_TRC20',
  USDC_BEP20 = 'USDC_BEP20',
  USDC_ERC20 = 'USDC_ERC20',
  USDT_ERC20 = 'USDT_ERC20',
  BNB = 'BNB',
  ETH = 'ETH',
  TRX = 'TRX',
  WBTC = 'WBTC',
  USD1_ERC20 = 'USD1_ERC20',
  USD1_BEP20 = 'USD1_BEP20'
}

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.RECEIVING,
  })
  wallet_type: WalletType;

  @Column({
    type: 'enum',
    enum: CurrencyType,
  })
  currency_type: CurrencyType;

  @Column({ type: 'varchar', length: 100 })
  wallet_name: string;

  @Column({ type: 'varchar', length: 256, unique: false })
  pub_key: string;

  @Column({ type: 'varchar', length: 256, unique: false, default: '' })
  address: string;

  @Column({ type: 'varchar', default: 0 })
  minBalance: string;

  @Column({ type: 'varchar', default: 0 })
  maxBalance: string;

  @Column({ type: 'bool', default: false })
  isRebalancer: boolean;

  @Column({ type: 'varchar', default: '' })
  rebalancingWallet: string;

  @Column({ type: 'varchar', default: '' })
  rebalancingPlatform: string;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'bool', default: false })
  isRebalancingActive: boolean;

  @Column({ type: 'bool', default: false })
  isTest: boolean;

  @Column({ type: 'json', default: [{ balance: '0.00', timeStamp: '2025-03-28T00:00:00.000Z' }], nullable: true })
  balanceHistory: Record<string, Date>[];
}
