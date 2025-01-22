import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BotOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  mmSellsToken: string;

  @Column({ type: 'text' })
  mmBuysToken: string;

  @Column({ type: 'float' })
  rateBinanceBuy1SellsForBuys: number;

  @Column('jsonb')
  orders: Array<{
    mmSellTokenAmount: number;
    ordersNumber: number;
    marginPercent: number;
  }>;
}