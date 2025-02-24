import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class PendingWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column()
  orderViewId: string;

  @Column({ type: 'varchar', default: '' })
  coinSymbol: string;

  @Column({ type: 'varchar', default: '' })
  accountType: string;

  @Column({ type: 'varchar', default: '' })
  platform: string;

  @Column({ type: 'int' })
  status: number;

  @CreateDateColumn()
  createdAt: Date;
}

