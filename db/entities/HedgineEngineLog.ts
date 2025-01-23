import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class HedgineEngineLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  txHash: string | null;

  @Column({ type: 'text', nullable: true })
  pairSwapDirectionOnSwap: string | null;

  @Column({ type: 'text', nullable: true })
  l1SwapAmount: string | null;

  @Column({ type: 'text', nullable: true })
  l2SwapAmount: string | null;

  @Column({ type: 'text', nullable: true })
  orderTypeOnBinance: string | null;

  @Column({ type: 'text', nullable: true })
  priceSettledToUser: string | null;

  @Column({ type: 'text', nullable: true })
  priceHedgedOnBinance: string | null;

  @Column({ type: 'text', nullable: true })
  marginValue: string | null;

  @Column({ type: 'text', nullable: true })
  profitFromSwap: string | null;

  @Column({ type: 'bool', default: false })
  fullfil: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

