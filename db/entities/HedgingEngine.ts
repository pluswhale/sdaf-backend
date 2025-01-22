import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class HedgingEngine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  walletAddress?: string;

  @Column()
  transactionHash: string;

  @Column({ type: 'int', default: 0, nullable: true })
  confirmations?: number;

  @Column({ default: '', nullable: true })
  fromCoin: string;

  @Column({ default: '', nullable: true })
  toCoin: string;

  @Column('decimal', { scale: 2, default: 0.0, nullable: true })
  amount: string;

  @CreateDateColumn()
  createdAt: Date;
}

