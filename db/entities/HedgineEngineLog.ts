import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Margin } from './Margin';

export enum Coins {
  USDT = 'USDT',
  BTC = 'BTC',
  BNB = 'BNB'
}

export enum Direction {
  BUY = 'BUY',
  SELL = 'SELL'
}

@Entity()
export class HedgineEngineLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @UpdateDateColumn()
  updatedAt: Date;
  
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text' })
  txHash: string | null;

  @Column({type: 'enum', enum: Coins, nullable: true})
  fromCoin: string | null;

  @Column({type: 'enum', enum: Coins, nullable: true})
  toCoin: string | null;

  @Column({ type: 'text', nullable: true })
  l1SwapAmount: string | null;

  @Column({ type: 'text', nullable: true})
  l2SwapAmount: string | null;

  @Column({ type: 'text' })
  direction: string | null;

  @Column({type: 'text'})
  targetWalletAddress: string;

  @Column({ type: 'text', nullable: true })
  priceSettledToUser: string | null;

  @Column({ type: 'text', nullable: true })
  priceHedgedOnBinance: string | null;

  @Column({type: 'text', nullable: true})
  amountSettledToUser: string | null;

  @Column({type: 'text', nullable: true})
  amountHedged: string | null;

  @Column({ type: 'text', nullable: true })
  profitFromSwap: string | null;

  @Column({ type: 'bool', default: false })
  isBuyBacked: boolean;

  @ManyToOne(type => Margin, margin => margin.hedgingEngineLogs, {nullable: true})
  margin: Margin | null;
}

