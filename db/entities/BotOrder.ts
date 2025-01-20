import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BotOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', default: '' })
  orderBody: string;
}

