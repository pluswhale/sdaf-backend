import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AmlWalletStatusEnum {
  BLACK = 'black',
  WHITE = 'white',
  CHECKING = 'checking',
}

export type AmlWalletStatusType = 'black' | 'white' | 'checking';

@Entity()
export class AmlCheckedWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column({
    type: 'enum',
    enum: AmlWalletStatusEnum,
  })
  status: AmlWalletStatusType;

  @CreateDateColumn()
  createdAt: Date;
}
