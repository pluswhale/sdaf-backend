import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class FinaliseLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text' })
  txHash: string | null;

  @Column({ type: 'text', nullable: true })
  currency: string | null;

  @Column({ type: 'text', nullable: true })
  l1SwapAmount: string | null;
}
