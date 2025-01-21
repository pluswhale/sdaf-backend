import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BotOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  c1: string;

  @Column({ type: 'text' })
  c2: string;

  @Column({ type: 'float' })
  c1UsdtRate: number;

  @Column({ type: 'float' })
  c2UsdtRate: number;

  @Column('jsonb') 
  orders: Array<{
    usdAmountC1: number;
    number: number;
    marginPercent: number;
  }>;
}