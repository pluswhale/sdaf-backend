import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class HedgingEngine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletAddress: string;

  @Column()
  transactionHash: string;

  @Column({ type: 'int' })
  confirmations: number;

  @Column({ default: '' })
  fromCoin: string;

  @Column({ default: '' })
  toCoin: string;

  @Column('decimal', { scale: 2, default: 0.0 })
  amount: string;

  @CreateDateColumn()
  createdAt: Date;
}

