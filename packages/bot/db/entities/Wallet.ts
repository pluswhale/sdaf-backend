import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum WalletType {
  RECEIVING = 'receiving',
  SENDING = 'sending',
}

export enum CurrencyType {
  BTC = 'BTC',
  USDT_BEP20 = 'USDT_BEP20',
  USDT_TRC20 = 'USDT_TRC20',
  USDT_ERC20 = 'USDT_ERC20',
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
}

