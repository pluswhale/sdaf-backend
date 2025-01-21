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

  @Column()
  fromCoin: string;

  @Column()
  toCoin: string;

  @Column('decimal')
  amount: string;

  @CreateDateColumn()
  createdAt: Date;
}

