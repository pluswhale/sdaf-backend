import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum WalletType {
  RECEIVING = 'receiving',
  SENDING = 'sending',
}

export enum CurrencyType {
  BTC = 'BTC',
  USDT = 'USDT',
  USDT_BEP20 = 'USDT_BEP20',
  USDT_TRC20 = 'USDT_TRC20',
  USDT_ERC20 = 'USDT_ERC20',
  BNB = 'BNB',
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

  @Column({ type: 'varchar', length: 256, unique: true })
  pub_key: string;

  @Column({ type: 'varchar', length: 256, unique: true, default: '' })
  address: string;

  @Column({ type: 'varchar', default: 0 })
  minBalance: string;

  @Column({ type: 'varchar', default: 0 })
  maxBalance: string;
}

