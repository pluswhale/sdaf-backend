import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class PendingWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column()
  orderViewId: string;

  @Column({ type: 'int' })
  status: number;

  @CreateDateColumn()
  createdAt: Date;
}

